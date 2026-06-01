import { Router } from 'express';
import Task from '../models/Task.js';
import { requireAuth } from '../middleware/auth.js';
import { validateTask } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task CRUD — users can only access their own tasks
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks for the logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, done]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Array of tasks
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  try {
    const filter = { owner: req.userId };
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ tasks });
  } catch (err) {
    console.error('Get tasks error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Build login page
 *               description:
 *                 type: string
 *                 example: Use React and Tailwind
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *                 default: todo
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', async (req, res) => {
  const errors = validateTask(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0] });

  try {
    const task = await Task.create({
      title:       req.body.title.trim(),
      description: req.body.description?.trim() || '',
      status:      req.body.status   || 'todo',
      priority:    req.body.priority || 'medium',
      owner:       req.userId,
    });
    return res.status(201).json({ message: 'Task created.', task });
  } catch (err) {
    console.error('Create task error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID (owner only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — not your task
 *       404:
 *         description: Task not found
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    return res.status(200).json({ task });
  } catch (err) {
    console.error('Get task error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task (owner only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Task updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — not your task
 *       404:
 *         description: Task not found
 */
router.put('/:id', async (req, res) => {
  const bodyToValidate = { title: req.body.title ?? 'placeholder', ...req.body };
  const errors = validateTask(bodyToValidate).filter(e => e !== 'Title is required.');
  if (errors.length) return res.status(400).json({ message: errors[0] });

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const { title, description, status, priority } = req.body;
    if (title !== undefined)       task.title       = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined)      task.status      = status;
    if (priority !== undefined)    task.priority    = priority;

    await task.save();
    return res.status(200).json({ message: 'Task updated.', task });
  } catch (err) {
    console.error('Update task error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task (owner only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — not your task
 *       404:
 *         description: Task not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    await task.deleteOne();
    return res.status(200).json({ message: 'Task deleted.' });
  } catch (err) {
    console.error('Delete task error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
