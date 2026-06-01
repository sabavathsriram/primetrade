export function validateRegister(body) {
  const errors = [];
  const { fullName, email, password } = body;

  if (!fullName || fullName.trim().length < 2)
    errors.push('Full name must be at least 2 characters.');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.push('Please enter a valid email address.');

  if (!password || password.length < 6)
    errors.push('Password must be at least 6 characters.');

  return errors;
}

export function validateTask(body) {
  const errors = [];
  const { title, status, priority } = body;

  if (!title || title.trim().length < 1)
    errors.push('Title is required.');

  if (title && title.trim().length > 200)
    errors.push('Title cannot exceed 200 characters.');

  if (status && !['todo', 'in-progress', 'done'].includes(status))
    errors.push('Status must be one of: todo, in-progress, done.');

  if (priority && !['low', 'medium', 'high'].includes(priority))
    errors.push('Priority must be one of: low, medium, high.');

  return errors;
}
