const { body, validationResult } = require('express-validator')
const userLoginValidationRules = () => {
  return [
    // username must be an email
    body('email').isEmail().withMessage('Email must be valid'),
    // password must be at least 5 chars long
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 chars long'),
  ]
}
const userRegisterValidationRules = () => {
  return [
   
  body("email").isEmail().withMessage("Email must be valid").withMessage("Email must be valid"),
  body("name").not().isEmpty().trim().escape().isLength({ min: 3, max: 20 }).withMessage("Name must be between 3 and 20 characters"),
  body("phone").isLength({ min: 10, max: 10 }).withMessage("Phone number must be 10 digit").isMobilePhone().withMessage("Phone must be valid"),
  // password must be at least 5 chars long
  body("password").isLength({ min: 5 }).withMessage('Password must be at least 5 chars long'),
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors,
  })
}

module.exports = {
  userLoginValidationRules,
  userRegisterValidationRules,
  validate,
}