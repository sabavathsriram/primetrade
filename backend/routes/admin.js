import { Router } from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireAdmin);

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin-only routes — requires Bearer token with role=admin
 */

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all registered users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of all users (passwords excluded)
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — admin role required
 */
router.get('/users', async (_req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    return res.status(200).json({ users });
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /api/v1/admin/tasks:
 *   get:
 *     summary: Get all tasks from all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of all tasks with owner info
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 */
router.get('/tasks', async (_req, res) => {
  try {
    const tasks = await Task.find()
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ tasks });
  } catch (err) {
    console.error('Admin get tasks error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /api/v1/admin/tasks/{id}:
 *   delete:
 *     summary: Delete any task by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID to delete
 *     responses:
 *       200:
 *         description: Task deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Task not found
 */
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    await task.deleteOne();
    return res.status(200).json({ message: 'Task deleted.' });
  } catch (err) {
    console.error('Admin delete task error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
