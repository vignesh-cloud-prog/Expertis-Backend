const appointmentServices = require("../services/appointment.services");

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
};

exports.getShopAppointments = (req, res, next) => {
  appointmentServices.getShopAppointments(req, res, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.getUserAppointments = (req, res, next) => {
  appointmentServices.getUserAppointments(req, res, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};
exports.getAppointment = (req, res, next) => {
  appointmentServices.getAppointment(req, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.cancelAppointment = (req, res, next) => {
  appointmentServices.cancelAppointment(req, res, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.acceptAppointment = (req, res, next) => {
  appointmentServices.acceptAppointment(req, res, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.rejectAppointment = (req, res, next) => {
  appointmentServices.rejectAppointment(req, res, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.completeAppointment = (req, res, next) => {
  appointmentServices.completeAppointment(req, res, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};
