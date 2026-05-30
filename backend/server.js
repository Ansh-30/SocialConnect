require('dotenv').config();

const express = require('express');

const cors = require('cors');

const mongoose = require('mongoose');

const app = express();


// ─────────────────────────────────────────────
// Allowed Frontend Origins
// ─────────────────────────────────────────────

const allowedOrigins = [

  'http://localhost:5173',

  'https://social-connect-woad.vercel.app',
];


// ─────────────────────────────────────────────
// CORS Configuration
// ─────────────────────────────────────────────

app.use(

  cors({

    origin: function (
      origin,
      callback
    ) {

      // Allow Postman / mobile apps
      if (!origin) {

        return callback(
          null,
          true
        );
      }


      if (
        allowedOrigins.includes(origin)
      ) {

        callback(null, true);

      } else {

        callback(

          new Error(
            'CORS not allowed'
          )
        );
      }
    },

    credentials: true,
  })
);


// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

app.use(

  express.json({

    limit: '10mb',
  })
);


app.use(

  express.urlencoded({

    extended: true,

    limit: '10mb',
  })
);


// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────

app.use(
  '/api/auth',
  require('./routes/auth')
);

app.use(
  '/api/users',
  require('./routes/users')
);

app.use(
  '/api/posts',
  require('./routes/posts')
);

app.use(
  '/api/search',
  require('./routes/search')
);

app.use(
  '/api/admin',
  require('./routes/admin')
);


// ─────────────────────────────────────────────
// Health Route
// ─────────────────────────────────────────────

app.get(

  '/api/health',

  (_req, res) => {

    res.status(200).json({

      success: true,

      status:
        'SocioConnect Backend Running 🚀',

      time: new Date(),
    });
  }
);


// ─────────────────────────────────────────────
// Root Route
// ─────────────────────────────────────────────

app.get('/', (_req, res) => {

  res.send(
    'SocioConnect Backend API Running 🚀'
  );
});


// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────

app.use(

  (err, _req, res, _next) => {

    console.error(

      '❌ SERVER ERROR:',

      err.message
    );


    res.status(
      err.status || 500
    ).json({

      success: false,

      message:
        err.message ||
        'Internal Server Error',
    });
  }
);


// ─────────────────────────────────────────────
// MongoDB Connection
// ─────────────────────────────────────────────

const PORT =
  process.env.PORT || 5000;


mongoose

  .connect(
    process.env.MONGO_URI
  )

  .then(() => {

    console.log(
      '✅ MongoDB Connected'
    );


    app.listen(PORT, () => {

      console.log(

        `🚀 Server running on port ${PORT}`
      );
    });
  })

  .catch((err) => {

    console.error(

      '❌ MongoDB Connection Error:',

      err.message
    );

    process.exit(1);
  });