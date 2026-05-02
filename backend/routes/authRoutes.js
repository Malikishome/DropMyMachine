const express = require('express');
const router = express.Router();
const supabase = require('../config/db');


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/signup', async (req, res) => {
  const { email, password, role, full_name } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // This will save roles and the full names to the profiles table
    const  { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      full_name,
    });

    if (profileError) {
      return res.status(400).json({ message: profileError.message });
    }

    res.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;