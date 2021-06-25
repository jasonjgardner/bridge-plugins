<template>
  <div>
    <v-text-field
      v-show="editPath || !hasWorkspacePath"
      label="bridge. Installation Path"
      v-model="workspace"
      :readonly="hasWorkspacePath && !editPath"
      :required="editPath"
      @blur="save"
    ></v-text-field>

    <div class="d-flex align-center justify-between">
      <v-autocomplete
        class="pr-4"
        label="Project File"
        v-model="selectedFile"
        :disabled="!hasWorkspacePath"
        :items="autocompleteItems"
        :prefix="normalizedWorkspace + '/'"
      >
        <template v-slot:prepend-inner>
          <v-btn icon @click="editPath = true"
            ><v-icon>mdi-folder</v-icon></v-btn
          >
        </template>
      </v-autocomplete>

      <v-btn
        class="ml-auto"
        @click="launch(selectedFile)"
        :disabled="!hasWorkspacePath"
        >Open
        <v-icon class="pl-2" color="indigo"
          >mdi-microsoft-visual-studio-code</v-icon
        ></v-btn
      >
    </div>

    <v-snackbar :value="message && message.length > 0">
      {{ message }}

      <template v-slot:action="{ attrs }">
        <v-btn color="primary" text v-bind="attrs" @click="message = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
const { getCurrentRP, getCurrentBP } = await require("@bridge/env");
const {
  readFilesFromDir,
  readJSON,
  writeJSON,
} = await require("@bridge/fs");
const { openExternal } = await require("@bridge/utils");

/**
 * Test if string looks like valid file path
 * @param {String} path File path to test
 * @param {Boolean} [win=true] TRUE is path is on Windows OS
 */
const isValidPath = (path, win = true) =>
  (!win && /^[^/]+/.test(path)) ||
  (path.length < 32755 &&
    /^[a-z]:((\\|\/)[a-z0-9\s_@\-^!#$%&+={}\[\]]+)+/i.test(path));

/**
 * Attempt to clean and normalize file path input
 * @param {String} str File path to clean
 */
const normalize = (str) =>
  str.toString().trim().replace(/\\+/g, "/").replace(/\/+$/, "");

export default {
  name: "CodeFileSelect",
  data: () => ({
    editPath: false,
    selectedFile: "",
    workspace: "",
    filesList: [],
    message: false,
    realPathSaved: false,
    protocol: "vscode://file/", /// TODO: Allow setting to "file://", "view-source://", "web+....", etc.
  }),
  async mounted() {
    await this.load();
    this.filesList = await this.getFiles();
  },
  methods: {
    async load() {
      const settings = await readJSON("data/settings.json");
      const realPath = settings["openInVSCode.realPath"];

      if (typeof realPath !== "string" || realPath.length < 1) {
        this.realPathSaved = false;
        return;
      }

      this.realPathSaved = true;
      const savedPath = normalize(realPath);

      if (isValidPath(savedPath)) {
        this.workspace = savedPath;
        return;
      }

      this.realPathSaved = false;
      this.message = "bridge. installation path is invalid";
      console.warn(
        "Invalid bridge. installation path stored in settings.json: %s",
        realPath
      );
    },
    async save() {
      if (this.normalizedWorkspace.length < 1) {
        return;
      }

      try {
        await writeJSON("data/settings.json", {
          ...(await readJSON("data/settings.json")),
          ...{
            "openInVSCode.realPath": this.normalizedWorkspace,
          },
        });
      } catch (err) {
        console.error("Could not save workspace path: %s", err);
        this.editPath = true;
        this.message = `Could not save workspace path "${this.normalizedWorkspace}"`;
        return;
      }

      this.editPath = false;
      this.message = "bridge. installation path saved!";
    },
    async getFiles() {
      let files = [];

      try {
        files.push(...(await readFilesFromDir(getCurrentRP())));
      } catch (err) {
        console.warn("Failed reading files from RP directory");
      }

      try {
        files.push(...(await readFilesFromDir(getCurrentBP())));
      } catch (err) {
        console.warn("Failed reading files from BP directory");
      }

      return files;
    },
    launch(file, dir = null) {
      const filePath = dir
        ? `${dir}/${file}`
        : `${this.normalizedWorkspace}/${file}`;
      openExternal(this.protocol + filePath);
      this.message = filePath + " sent to VS Code";
    },
  },
  computed: {
    normalizedWorkspace() {
      const path = normalize(this.workspace);
      return isValidPath(path) ? path : "";
    },
    hasWorkspacePath() {
      return isValidPath(this.workspace);
    },
    autocompleteItems() {
      return this.filesList.map(({ path: text }) => ({
        text,
      }));
    },
  },
};
</script>
