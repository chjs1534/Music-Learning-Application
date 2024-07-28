exports.handler = async (event) => {
    // Confirm the user
    event.response.autoConfirmUser = true;

    return event;
}
