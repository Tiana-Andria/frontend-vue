<template>
  <div>
    <h1>Éditeur Collaboratif</h1>
    <div
      contenteditable="true"
      @input="updateContent"
      ref="contentEditable"
      style="border: 1px solid black; min-height: 100px;"
    ></div>
  </div>
</template>

<script>
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export default {
  data() {
    return {
      ydoc: null,
      ytext: null,
      wsProvider: null,
    };
  },
  created() {
    // Initialize Y.js document and data structures
    this.ydoc = new Y.Doc();
    this.ytext = this.ydoc.getText('content'); // Use Y.Text for plain text

    // Connect to WebSocket server and share the Y.js document
    this.wsProvider = new WebsocketProvider('ws://localhost:9098', 'shared-editor', this.ydoc);

    // Bind Y.js Y.Text to the contenteditable div
    this.ytext.observe(event => {
      this.$refs.contentEditable.innerHTML= event.currentTarget.toString();
    });
  },
  methods: {
    updateContent() {
    // Update Y.js Y.Text when the user types
    const newHTML = this.$refs.contentEditable.innerHTML;
    
    // Mise à jour de Y.js Y.Text avec le nouveau contenu HTML
    this.ytext.delete(0, this.ytext.length);
    this.ytext.insert(0, newHTML);
  },
  },
};
</script>
