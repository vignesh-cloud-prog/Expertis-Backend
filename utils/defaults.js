exports.workingHours = {
  sunday: {
    isOpen: true,
    openingTime: "06:00 AM",
    closingTime: "11:00 PM",
    breaks: [
      {
        from: "02:00 PM",
        to: "03:00 PM",
        reason: "Lunch hours",
      },
    ],
  },
  monday: {
    isOpen: true,
    openingTime: "06:00 AM",
    closingTime: "11:00 PM",
    breaks: [
      {
        from: "02:00 PM",
        to: "03:00 PM",
        reason: "Lunch hours",
      },
    ],
  },
  tuesday: {
    isOpen: false,
    openingTime: "06:00 AM",
    closingTime: "11:00 PM",
    breaks: [
      {
        from: "02:00 PM",
        to: "03:00 PM",
        reason: "Lunch hours",
      },
    ],
  },
  wednesday: {
    isOpen: true,
    openingTime: "06:00 AM",
    closingTime: "11:00 PM",
    breaks: [
      {
        from: "02:00 PM",
        to: "03:00 PM",
        reason: "Lunch hours",
      },
    ],
  },
  thursday: {
    isOpen: true,
    openingTime: "06:00 AM",
    closingTime: "11:00 PM",
    breaks: [
      {
        from: "02:00 PM",
        to: "03:00 PM",
        reason: "Lunch hours",
      },
    ],
  },
  friday: {
    isOpen: true,
    openingTime: "06:00 AM",
    closingTime: "11:00 PM",
    breaks: [
      {
        from: "02:00 PM",
        to: "03:00 PM",
        reason: "Lunch hours",
      },
    ],
  },
  saturday: {
    isOpen: true,
    openingTime: "06:00 AM",
    closingTime: "11:00 PM",
    breaks: [
      {
        from: "02:00 PM",
        to: "03:00 PM",
        reason: "Lunch hours",
      },
    ],
  },
};

exports.defaultRoles = {
  isAdmin: false,
  isShopMember: false,
  isUser: true,
  isShopOwner: false,
};
