const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Ensure jwt is imported
const secretKey = process.env.SECRET_KEY; // Replace with your actual secret key


module.exports = {
  signup: async function (req, res) {
    // console.log('req-----', req.session);
    try {
      const { name, email, password, role, enterpriseId } = req.body;

      // Check if all required fields are present
      if (!name || !email || !password || !enterpriseId) {
        return res.status(400).json({ success: false, message: 'Fields are require...' });
      }
      const existingUser = await User.findOne({ email, role: 0 });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }


      const hash = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hash,
        role,
        enterpriseId,
      }).fetch();
      const token = jwt.sign({ _id: newUser.id, email: newUser.email }, secretKey);

      newUser.token = token;
      req.session.token = token;
      res.cookie('authToken', token, { httpOnly: false, secure: true });
      await User.updateOne({ id: newUser.id }).set({ token });

      req.body.addedBy === 'superAdmin' && res.redirect(`/enterpriselist/${newUser.enterpriseId}`);
      req.body.addedBy === 'admin' && res.redirect(`/adminenterprise/${newUser.enterpriseId}`);

      // return res.view('pages/dashboard', { token: token, user: newUser });
      return res.redirect('/dashboard');

    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  register: async function (req, res) {
    try {
      const enterprise = await Enterprise.find().select(['id', 'name']);
      return res.view('pages/userRegister', {
        enterprise: enterprise,
      });
    } catch (error) {
      // console.error('Failed to retrieve users:', error);
      return res.status(500).json({ message: 'Fail To get enterprise', error });
    }
  },
  signin: async function (req, res) {
    // const checkToken = req.body.token;
    // console.log('-----signin token --',checkToken)
    try {

      // if (checkToken) {
      //   return res.redirect('/dashboard');
      // };

      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(401).json({ message: USER_NOT_FOUND });
      }

      const isAuth = bcrypt.compareSync(req.body.password, user.password);
      if (!isAuth) {
        return res.status(401).json({ message: 'incorrect password' });
      }

      const token = jwt.sign({ email: req.body.email, _id: user.id }, secretKey);
      user.token = token;
      req.session.token = token;
      res.cookie('authToken', token, { httpOnly: false, secure: true });
      await User.updateOne({ id: user.id }).set({ token });
      // console.log('session----', req.session);
      // return res.status(200).json({ message: 'login successfull', token });
      // return res.view('pages/dashboard', { token: token, user: user });
      return res.redirect('/dashboard');
    } catch (error) {
      // console.error('Signin error:', error);
      return res.status(500).json({ message: 'login fail', error });
    }
  },
};

