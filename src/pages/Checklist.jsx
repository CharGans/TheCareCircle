import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useStore from '../store/useStore';
import Nav from '../components/Nav';
import './Checklist.css';

function Checklist() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const currentCircle = useStore(state => state.currentCircle);

  useEffect(() => {
    if (currentCircle) loadTasks();
  }, [currentCircle]);

  const loadTasks = async () => {
    const data = await api.tasks.getAll(currentCircle.id);
    setTasks(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.tasks.create(currentCircle.id, newTask);
    setNewTask('');
    loadTasks();
  };

  const toggleTask = async (taskId, completed) => {
    await api.tasks.update(currentCircle.id, taskId, !completed);
    loadTasks();
  };

  const deleteTask = async (taskId) => {
    await api.tasks.delete(currentCircle.id, taskId);
    loadTasks();
  };

  if (!currentCircle) return <div>Select a circle first</div>;

  return (
    <div className="checklist">
      <Nav />
      <div className="content">
        <h2>Checklist - {currentCircle.name}</h2>
        
        <form onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="New task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            required
          />
          <button type="submit">Add Task</button>
        </form>
        
        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id, task.completed)}
              />
              <span className={task.completed ? 'completed' : ''}>{task.title}</span>
              {task.completed_by_name && <small>by {task.completed_by_name}</small>}
              <button className="delete-task-btn" onClick={() => deleteTask(task.id)}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Checklist;
