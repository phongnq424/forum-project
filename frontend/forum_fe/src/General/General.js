const General = {
  constValue: {
    dateTimeFormat: "dd/MMM/yyyy",
  },

  createError: function (error) {
    const newErr = new Error(
      error.data?.error ||
        error.data?.message ||
        `FE Error! Detail is that ${error.message}`
    );
    newErr.status = error.status || -1;

    return newErr;
  },

  stringError: function (error) {
    return `Status: ${error.status}; Message: ${error.message}`;
  },

  reactionType: {
    LOVE: "LOVE",
  },

  menuOptions: {
    SEE_PROFILE: { id: 0, name: "See Profile" },
    EDIT_PROFILE: { id: 1, name: "Edit Profile" },
    LOG_OUT: { id: 2, name: "Log Out" },

    asArray() {
      return Object.values(this).filter((item) => typeof item != "function");
    },
  },

  optionOfCreateProfilePage: {
    CREATE: "Create",
    UPDATE: "Update",
  },

  genders: {
    MALE: { id: "MALE", gender: "Male" },
    FEMALE: { id: "FEMALE", gender: "Female" },
    OTHER: { id: "OTHER", gender: "Other" },

    asArray() {
      return Object.values(this).filter((item) => typeof item != "function");
    },
  },

  showFor: {
    ALL: "all",
    OWN: "own",
    VIEWER: "viewer",
  },
};

export default General;
