const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Ensure jwt is imported
const secretKey = process.env.SECRET_KEY;
module.exports = {
  getAllUser: async function (req, res) {
    try {
      const users = await User.find();
      return res.status(200).json({ success: true, users });
    } catch (error) {
      // console.error('Failed to retrieve users:', error);
      return res.status(500).json({ message: 'Fail To Retrieve User', error });
    }
  },
  addUser: async function (req, res) {
    console.log('---req body', req.body);
    try {
      const { name, email, password, role, enterpriseId, addedBy } = req.body;

      // Check if all required fields are present
      if (!name || !email || !password || !enterpriseId) {
        return res.status(400).json({ success: false, message: 'Fields are required.' });
      }

      // Check if the email is already in use by another user
      if (role === '0') {
        const existingSuperAdmin = await User.findOne({ role: 0 });
        if (existingSuperAdmin) {
          return res.status(400).json({ success: false, message: 'Super Admin exist.' });
        }

      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use.' });
      }
      const hash = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name,
        email,
        password: hash,
        role,
        enterpriseId,
      }).fetch();


      if (addedBy === 'superAdmin') {
        res.redirect(`/enterpriselist/${newUser.enterpriseId}`);
      } else if (addedBy === 'admin') {
        res.redirect(`/adminenterprise/${newUser.enterpriseId}`);
      } else {
        res.redirect('/');
      }
      return res.json({ success: true, message: 'User created successfully!' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getUserByToken: async function (req, res) {
    // const token = req.params.token
    try {
      const user = req.user;

      // Assume you have a Token or Session model to verify the token

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.json({ user });
    } catch (err) {
      return res.status(500).json({ error: 'Server error.' });
    }
  },
  deleteUser: async function (req, res) {
    // console.log("---id", req.params.id)
    try {
      const id = req.params.id;

      const user = await User.findOne({ id });

      // console.log("----user", user)
      if (!user) {
        return res.status(404).json({ message: 'user not found' });
      }

      const deletedUser = await User.destroyOne({ id });

      return res.status(200).json({ message: 'user successFully Deleted', deletedUser });
    } catch (error) {
      // console.log("----err", error);
      return res.status(500).json({ message: 'User Fail to delete', error });
    }
  },
  userProfile: async function (req, res) {
    // console.log('===req.params', req.params.id);
    const userId = req.params.id;
    // console.log('===id', userId);
    try {
      const user = await User.findOne({ id: userId });
      const enterprise = await Enterprise.findOne({ id: user.enterpriseId });


      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.view('pages/profile', {
        user: user,
        enterprise: enterprise
      });
    } catch (error) {
      console.error('Failed to retrieve user profile:', error);
      return res.status(500).json({ message: 'Failed to get user profile', error });
    }
  },

  updateUser: async function (req, res) {
    const id = req.params.id; // Get the user ID from request parameters
    console.log('----update req body', req.body);

    try {
      // Find the user by ID
      const user = await User.findOne({ id });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }


      // Update user
      await User.updateOne({ id }).set(req.body);

      // Redirect based on the addedBy property
      if (req.body.addedBy === 'superAdmin') {
        return res.redirect(`/enterpriselist/${user.enterpriseId}`);
      } else if (req.body.addedBy === 'admin') {
        return res.redirect(`/adminenterprise/${user.enterpriseId}`);
      } else {
        return res.redirect(`/userprofile/${id}`);
      }
    } catch (error) {
      console.error('Update user error:', error); // Log the error for debugging
      return res.status(500).json({ message: 'Failed to update', error });
    }
  },

  removeUser: async function (req, res) {
    // console.log('req.body remove user---', req.body);
    try {
      const { id: userId, enterpriseId } = req.body;
      // console.log('---remove user', userId, enterpriseId);

      // Update the user's role to 99
      await User.updateOne({ id: userId }).set({ role: 99 });

      if (addedBy = 'superAdmin') {
        return res.redirect(`/enterpriselist/${enterpriseId}`);
      } else if (addedBy = 'admin') {
        return res.redirect(`/adminenterprise/${enterpriseId}`);
      }
      else {
        return res.redirect(`/userprofile/${id}`);
      }

    } catch (error) {
      console.error('Error removing user:', error);
      return res.serverError(error);
    }
  }
};
