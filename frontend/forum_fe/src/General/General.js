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
};

export default General;
