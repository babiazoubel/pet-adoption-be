const User = require('../models/User');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//helpers
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class UserController {
  // REGISTER
  static async register(req, res) {
    const { name, lastName, email, phone, password, confirmPassword } =
      req.body;

    //validation
    if (!name) {
      res.status(422).json({ message: 'Name is mandatory' });
      return;
    }

    if (!lastName) {
      res.status(422).json({ message: 'Last name is mandatory' });
      return;
    }

    if (!email) {
      res.status(422).json({ message: 'Email is mandatory' });
      return;
    }

    if (!phone) {
      res.status(422).json({ message: 'Phone number is mandatory' });
      return;
    }

    if (!password) {
      res.status(422).json({ message: 'Password is mandatory' });
      return;
    }

    if (!confirmPassword) {
      res.status(422).json({ message: 'You need to confirm your password' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(422).json({ message: 'The password need to be the same' });
      return;
    }

    // check if user exists
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      res.status(422).json({ message: 'Please, use other email' });
      return;
    }

    // create a password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // create a user
    const user = new User({
      name: name,
      lastName: lastName,
      email: email,
      phone: phone,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  // LOGIN
  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(422).json({ message: 'Email is mandatory' });
      return;
    }

    if (!password) {
      res.status(422).json({ message: 'Password is mandatory' });
      return;
    }

    // check if user exists
    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(422).json({ message: 'This email has no user registrated' });
      return;
    }

    // check if password match with db password
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(422).json({ message: 'Password invalid' });
      return;
    }

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, 'oursecrettomakemorereliable');

      currentUser = await User.findById(decoded.id);
      currentUser.password = undefined;
    } else {
      currentUser = null;
    }

    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const id = req.params.id;

    const user = await User.findById(id)

    if (!user) {
      res.status(422).json({
        message: 'User not founded',
      });
      return;
    }

    res.status(200).json({ user });
  }

  // EDIT
  static async editUser(req, res) {
    //check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);

    const { name, lastName, email, phone, password, confirmPassword } =
      req.body;

    let image = '';
    

    if (req.file) {
      image = req.file.filename;
    }

    //validation
    if (!name) {
      res.status(422).json({ message: 'Name is mandatory' });
      return;
    }

    if (!lastName) {
      res.status(422).json({ message: 'Last name is mandatory' });
      return;
    }

    if (!email) {
      res.status(422).json({ message: 'Email is mandatory' });
      return;
    }

    // check if email has already taken
    const userExists = await User.findOne({ email: email });

    if (user.email !== email && userExists) {
      res.status(422).json({
        message: 'Please, use another email',
      });
      return;
    }

    user.email = email;

    if (image) {
      const imageName = req.file.filename;
      user.image = imageName;
    }

    if (!phone) {
      res.status(422).json({ message: 'Phone number is mandatory' });
      return;
    }

    user.phone = phone;

    // check if password match
    if (password != confirmPassword) {
      res.status(422).json({ message: 'The password need to be the same' });

      // change password
    } else if (password == confirmPassword && password != null) {
      //creating password
      const salt = await bcrypt.genSalt(12);
      const reqPassword = req.body.password;
      const passwordHash = await bcrypt.hash(reqPassword, salt);

      user.password = passwordHash;
    }

    try {
      //returns user updated data
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );

      res
        .status(200)
        .json({ message: 'User updated with success', data: userUpdated });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
};
