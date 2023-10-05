<template>
    <div>
      <h1>Liste de Tâches Collaborative</h1>
      <input v-model="newTask" @keyup.enter="addTask" placeholder="Ajouter une tâche..." />
      <ul>
        <li v-for="(task, index) in tasks" :key="index">{{ task }}</li>
      </ul>
    </div>
  </template>
  
  <script>
  import * as Y from 'yjs';
  import { WebsocketProvider } from 'y-websocket';
  
  export default {
    data() {
      return {
        newTask: '',
        tasks: [],
        ydoc: null,
        taskList: null,
        wsProvider: null,
      };
    },
    created() {
      // Initialize Y.js document and data structures
      this.ydoc = new Y.Doc();
      this.taskList = this.ydoc.getArray('taskList');
  
      // Connect to WebSocket server and share the Y.js document
      this.wsProvider = new WebsocketProvider('ws://localhost:9098', 'shared-tasks', this.ydoc);
  
      // Listen for changes in the task list
      this.taskList.observe(() => {
        this.tasks = this.taskList.toArray();
      });
    },
    methods: {
      addTask() {
        if (this.newTask.trim() !== '') {
          this.taskList.insert(0, [this.newTask]);
          this.newTask = '';
        }
      },
    },
  };
  </script>
  