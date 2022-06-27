const appointmentServices = require('../services/appointment.services');

exports.bookAppointment = (req, res, next) => {
    console.log(req.body);

    appointmentServices.bookAppointment(req.body, (error, results) => {
      if (error) {
        return next(error);
      }
      return res.status(200).send({
        message: "Success",
        data: results,
      });
    });
  }