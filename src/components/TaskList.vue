<template>
    <div>
        <div class="formulaire">
            <div class="taskName">            
                <label>Nom de la tache : </label>
                <input type="text" v-model="newTask.desc" />
            </div>
            <div class="taskStatus">
                <label>complete</label>
                <input type="checkbox" v-model="newTask.complete" />
            </div>
            <div class="add">
                <button @click="addtask(newTask)">Add</button>
            </div>
        </div>
        <hr>
        <br>
        <br>
        <div class="search">
            <label>Rechercher : </label>
            <input type="text" v-model="search" />
        </div>
        <table>
            <tr v-for="task in tasks" :key="task.id">
                <td>
                    #{{ task.id }} 
                </td>
                <td>
                    #{{ task.desc }} 
                </td>
                <td>
                    {{ task.complete ? "🆗" : "❌" }}
                </td>
                <td>
                    <button @click="deleteTask(task.id)">🗑</button>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    
    export default{
        name: "TaskList",
        data(){
            return {
                newTask : {
                    desc : "",
                    complete : false
                },
                tasks : [
                    {
                        id : 1,
                        desc : "Faire un test",
                        complete : true,
                    },
                    {
                        id : 2,
                        desc : "Coder",
                        complete : true,
                    },
                    {
                        id : 3,
                        desc : "Debeuger",
                        complete : false,
                    }
                 ]
            }
        },

        methods : {
            addtask(newTask){
                console.log(this.tasks.length)
                let newtask = {
                    id : this.tasks.length,
                    desc : newTask.desc,
                    complete : newTask.complete
                }

                this.tasks.push(newtask)

            },

            deleteTask(id){
                this.tasks.splice(id -1, 1)
            },
        },

        computed : {
            search(val)
            {
                console.log(this.tasks)
                return this.tasks.filter((task)=>{
                    return val == task.desc.toLowerCase()
                })
            }
        }
    }

</script>

<style scoped>

    table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
    }

    td, th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
    }

    tr:nth-child(even) {
    background-color: #dddddd;
    }
    ul{
        list-style-type: none;
    }
    .formulaire{
        display: flex;
        align-items: center;
        justify-content: space-evenly;
    }

    .taskName{
        display: flex;
    }

    .taskStatus
    {
        display: flex;
    }

</style>

