const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../../../models/api/v1/User');
const authMiddleware = require('../../../middleware/Authentication');


// Registratie functie (POST)
const register = async (req, res) => {
    const {
        email,
        password,
        firstName,
        lastName,
        country,
        postcode,
        city,
        street,
        houseNumber,
        phoneNumber,
        gender,
        profilePicture
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            message: "Email en wachtwoord zijn verplicht.",
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "E-mail is al geregistreerd.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            country,
            postcode,
            city,
            street,
            houseNumber,
            phoneNumber,
            gender,
            profilePicture
        });

        await user.save();

        // Maak token aan na registratie
        const token = jwt.sign({ userId: user._id }, 'je_geheime_sleutel', { expiresIn: '1h' });
        user.token = token;
        await user.save();

        res.status(201).json({
            status: "success",
            data: { user, token },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Er is een fout opgetreden bij het registreren.",
            error: error.message,
        });
    }
};

// Login functie (POST)
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            message: "Email en wachtwoord zijn verplicht.",
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Ongeldige inloggegevens.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: "error",
                message: "Ongeldige inloggegevens.",
            });
        }

        const token = jwt.sign({ userId: user._id }, 'je_geheime_sleutel', { expiresIn: '1h' });
        user.token = token;
        await user.save();

        res.status(200).json({
            status: "success",
            data: { token },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Er is een fout opgetreden bij het inloggen.",
            error: error.message,
        });
    }
};

// Profiel ophalen (GET /me)
const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json({
            status: "success",
            data: { user },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Interne server fout",
            error: error.message,
        });
    }
};

const setProfilePicture = async (req, res) => {
    const { profilePicture } = req.body;

    if (!profilePicture) {
        return res.status(400).json({
            status: 'error',
            message: 'Profielfoto is verplicht.',
        });
    }

    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Gebruiker niet gevonden.' });
        }

        // Alleen instellen als nog niet aanwezig
        if (user.profilePicture) {
            return res.status(400).json({
                status: 'error',
                message: 'Profielfoto is al ingesteld. Gebruik PUT om te updaten.',
            });
        }

        user.profilePicture = profilePicture;
        await user.save();

        res.status(201).json({
            status: 'success',
            message: 'Profielfoto succesvol opgeslagen.',
            data: { profilePicture: user.profilePicture },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Fout bij opslaan van profielfoto.',
            error: error.message,
        });
    }
};

const updatePassword = async (req, res) => {
    const { password } = req.body;
  
    if (!password || password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Wachtwoord moet minstens 6 tekens lang zijn.',
      });
    }
  
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'Gebruiker niet gevonden.' });
      }
  
      user.password = await bcrypt.hash(password, 10);
      await user.save();
  
      res.status(200).json({
        status: 'success',
        message: 'Wachtwoord succesvol bijgewerkt.',
      });
    } catch (error) {
      console.error("🔥 [updatePassword] Error:", error);
      res.status(500).json({
        status: 'error',
        message: 'Er is een fout opgetreden bij het bijwerken van het wachtwoord.',
        error: error.message,
      });
    }
  };


// GET /api/users/profile-picture
const getProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('profilePicture');
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Gebruiker niet gevonden.' });
        }

        res.status(200).json({
            status: 'success',
            data: { profilePicture: user.profilePicture },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Fout bij ophalen van profielfoto.',
            error: error.message,
        });
    }
};
       // POST /api/users/profile-picture

        // PUT /api/users/profile-picture
const updateProfilePicture = async (req, res) => {
    const { profilePicture } = req.body;

    if (!profilePicture) {
        return res.status(400).json({
            status: 'error',
            message: 'Profielfoto is verplicht.',
        });
    }

    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Gebruiker niet gevonden.' });
        }

        user.profilePicture = profilePicture;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Profielfoto succesvol bijgewerkt.',
            data: { profilePicture: user.profilePicture },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Fout bij bijwerken van profielfoto.',
            error: error.message,
        });
    }
};

// Wachtwoord reset aanvragen functie (POST /forgot-password)
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            status: "error",
            message: "Email is verplicht.",
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Gebruiker niet gevonden.",
            });
        }

        // Genereer een willekeurige resetcode
        const resetPasswordCode = Math.floor(100000 + Math.random() * 900000); // 6-cijferige code
        const resetPasswordExpire = Date.now() + 3600000; // Code vervalt na 1 uur

        // Sla de resetcode en vervaldatum op in de database
        user.resetPasswordCode = resetPasswordCode;
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save();

        // Verzend een e-mail met de resetcode (gebruik bijvoorbeeld nodemailer)
        const transporter = nodemailer.createTransport({
            service: 'gmail',  // Gebruik je eigen service en instellingen
            auth: {
                user: 'dante.verbiest@gmail.com',
                pass: 'jldg jrqj qxdf cabr',
            }
        });

        const mailOptions = {
            to: user.email,
            from: 'your-email@gmail.com',
            subject: 'Wachtwoord Reset Verzoek',
            text: `Gebruik de volgende code om je wachtwoord te resetten: ${resetPasswordCode}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: "success",
            message: "Een wachtwoordreset-code is naar je e-mail gestuurd.",
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Er is een fout opgetreden bij het versturen van de resetcode.",
            error: error.message,
        });
    }
};

// Verificatie van de resetcode functie (POST /verify-reset-code)
const verifyResetCode = async (req, res) => {
    const { email, resetPasswordCode } = req.body;

    if (!email || !resetPasswordCode) {
        return res.status(400).json({
            status: "error",
            message: "Email en resetcode zijn verplicht.",
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Gebruiker niet gevonden.",
            });
        }

 

        // Controleer of de resetcode overeenkomt en niet verlopen is
        if (user.resetPasswordCode !== resetPasswordCode) {
            return res.status(400).json({
                status: "error",
                message: "Ongeldige resetcode.",
            });
        }

        if (Date.now() > user.resetPasswordExpire) {
            return res.status(400).json({
                status: "error",
                message: "De resetcode is verlopen.",
            });
        }

        // Als de code geldig is, stuur een succesbericht
        res.status(200).json({
            status: "success",
            message: "De resetcode is geldig.",
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Er is een fout opgetreden bij de verificatie van de resetcode.",
            error: error.message,
        });
    }
};

// Wachtwoord resetten functie (PUT /reset-password)
const resetPassword = async (req, res) => {
    const { email, resetPasswordCode, newPassword } = req.body;

    if (!email || !resetPasswordCode || !newPassword) {
        return res.status(400).json({
            status: "error",
            message: "Email, resetcode en nieuw wachtwoord zijn verplicht.",
        });
    }

    try {
        // Verifieer de resetcode voordat we het wachtwoord resetten
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Gebruiker niet gevonden.",
            });
        }

        // Controleer of de resetcode overeenkomt en niet verlopen is
        if (user.resetPasswordCode !== resetPasswordCode) {
            return res.status(400).json({
                status: "error",
                message: "Ongeldige resetcode.",
            });
        }

        if (Date.now() > user.resetPasswordExpire) {
            return res.status(400).json({
                status: "error",
                message: "De resetcode is verlopen.",
            });
        }



        // Stel het nieuwe wachtwoord in
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordCode = undefined; // Verwijder de code na gebruik
        user.resetPasswordExpire = undefined; // Verwijder de vervaldatum
        await user.save();

        res.status(200).json({
            status: "success",
            message: "Je wachtwoord is succesvol gewijzigd.",
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Er is een fout opgetreden bij het resetten van het wachtwoord.",
            error: error.message,
        });
    }
};

const updateMe = async (req, res) => {
    const updates = req.body;
    console.log("🔧 [updateMe] Received updates:", updates);
    console.log("🔧 [updateMe] Authenticated user ID:", req.user?.userId);
  
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        console.error("❌ [updateMe] User not found.");
        return res.status(404).json({ status: "error", message: "Gebruiker niet gevonden." });
      }
  
      const allowedFields = ["firstName", "lastName", "email"];
  
      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(updates, field)) {
          console.log(`📝 Updating ${field} to:`, updates[field]);
          user[field] = updates[field];
        }
      });
  
      await user.save();
  
      console.log("✅ [updateMe] Profile updated:", user);
  
      res.status(200).json({
        status: "success",
        message: "Profiel succesvol bijgewerkt.",
        data: { user },
      });
    } catch (error) {
      console.error("🔥 [updateMe] Error:", error);
      res.status(500).json({
        status: "error",
        message: "Fout bij bijwerken van profiel.",
        error: error.message,
      });
    }
  };

  const addTrips = async (req, res) => {
    try {
      const { amount } = req.body; // e.g. { amount: 10 }
      if (!amount || amount <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Please specify a valid amount of trips to add.'
        });
      }
  
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found.'
        });
      }
  
      user.tripcount += amount;
      await user.save();
  
      res.status(200).json({
        status: 'success',
        message: `${amount} trips added successfully.`,
        data: { tripcount: user.tripcount }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while adding trips.',
        error: error.message
      });
    }
  };

  // Decrement tripcount endpoint
const decrementTripCount = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Gebruiker niet gevonden.',
      });
    }

    if (user.tripcount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Je hebt geen trips meer over.',
      });
    }

    user.tripcount -= 1;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Tripcount succesvol verlaagd.',
      data: { tripcount: user.tripcount },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Er is een fout opgetreden bij het verlagen van tripcount.',
      error: error.message,
    });
  }
};



module.exports = {
    register,
    login,
    me,
    updateMe,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    getProfilePicture,
    updateProfilePicture,
    setProfilePicture,
    updatePassword,
    addTrips,
    decrementTripCount,
};
