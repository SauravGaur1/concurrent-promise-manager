// TODO: Implement onComplete for PromiseQueue;
// TODO 100 : implement TaskManager and task.isActive or likewise methods

const promiseDelay = seconds => { 
    return new Promise((resolves, rejects)=>{
        setTimeout(resolves, seconds * 1000, "completed");
    })
 }

let tasks = [
    promiseDelay(2),
    promiseDelay(5),
    promiseDelay(3),
    promiseDelay(7),
    promiseDelay(10),
    promiseDelay(6),
    promiseDelay(3),
    promiseDelay(8),
    promiseDelay(1),
    promiseDelay(3),
    promiseDelay(7),
    promiseDelay(2),
    promiseDelay(6),
    promiseDelay(3),
    promiseDelay(8),
    promiseDelay(1),
    promiseDelay(3),
];

class Task {
    static count = 0;
    constructor(promise, uuid, queue){
        this.queue = queue;
        this.promise = promise;
        this.uuid = uuid != null || uuid != undefined ? uuid : this.count++;
    }
}

class PromiseQueue {

    constructor (
        promises = [],
        concurrentCount = 1,
        onComplete = () => {},
    ) {
        this.promises = promises;
        this.concurrentCount = concurrentCount;
        this.activeTasks = [];
        this.completedTasks = [];
        this.jobs = {};
        this.onComplete = onComplete;
        this.promises.forEach((promise, idx) => {
            let task = new Task(promise, idx, this);
            // TODO 100 : refer here;
            this.jobs[task.uuid] = task.promise;
        })
    }

    canRunNext() {
        return (this.activeTasks.length <= this.concurrentCount && this.promises.length);
    }

    getActiveTasksCount () {
        return this.activeTasks.length;
    }

    getActiveTasks() {
        return this.activeTasks
    }

    getCompletedTasks() {
        return this.completedTasks
    }

    isActive() {
        return this.activeTasks.length || !this.promises.length;
    }

    isCompleted() {
        console.log(this.completedTasks.length , "/" ,Object.keys(this.jobs).length);
        return Object.keys(this.jobs).length == this.completedTasks.length;
    }

    async getTaskStatus(uuid) {
        const status = await this.jobs[uuid];
        console.log(status);
        if(status == "completed") return "Completed";

        return "Waiting";
    }

    startQueue(cb) {
        while(this.canRunNext()){
            const task = this.promises.shift();
            task.then(async (data)=>{
                const task = this.activeTasks.shift();
                this.jobs[Object.keys(this.jobs)[0]] = "done";
                this.completedTasks.push(task);
                console.clear();
                console.log(`
                    ConcurrentCount : [ ${this.activeTasks.length} ], 
                    Active Tasks : [ ${this.activeTasks.map((_) => 'X')} ],
                    Completed Tasks :[ ${this.completedTasks.map((_) => 'X')} ],
                    ALL Tasks :[ ${this.promises.map((_) => 'X')} ],
                `);
                if(this.isCompleted()) {
                    this.onComplete();
                }else
                    this.startQueue(cb);
                
            })

            this.activeTasks.push(task);

        }
    }

}

concQueue = new PromiseQueue(
    tasks,
    5, 
    () => console.log("Queue Completed, onComplete method triggered!")
);

concQueue.startQueue();

// console.log(concQueue.getTaskStatus(16));
