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
    SEE_PROFILE: "See Profile",
    EDIT_PROFILE: "Edit Profile",
    LOG_OUT: "Log out",

    asArray() {
      return Object.values(this).filter((item) => typeof item != "function");
    },
  },
};

export default General;
