pragma solidity ^0.5.0;

contract TodoList {
  uint public taskCount = 0;

  struct Task {
    uint id;
    string content;
    bool completed;
  }

  mapping(uint => Task) public tasks;

  // Event to call when task is created
  event TaskCreated(
    uint id,
    string content,
    bool completed
  );

  // Event to call when task is completed
  event TaskCompleted(
    uint id,
    bool completed
  );

  constructor() public {
    createTask("First task of blockchain AB");
  }

  // Keeps the _content variable in memory
  function createTask(string memory _content) public {
    taskCount ++;
    tasks[taskCount] = Task(taskCount, _content, false);
    // Trigger event when task is created
    // Consumer can subscribe to events
    emit TaskCreated(taskCount, _content, false);
  }

  // Use _var for local variables
  function toggleCompleted(uint _id) public {
    Task memory _task = tasks[_id];
    _task.completed = !_task.completed;
    tasks[_id] = _task;
    emit TaskCompleted(_id, _task.completed);
  }

}