exports.handler = async (event) => {
    const userAttributes = event.request.userAttributes;
    const userType = userAttributes['custom:userType'];
    const clientMetadata = event.request.clientMetadata;

    // Determine platform based on client metadata
    const platform = clientMetadata ? clientMetadata.platform : null;

    if (userType === 'Child') {
        if (platform === 'web') {
            throw new Error("Children cannot sign in on web");
        }
    } 
    
    if (userType === 'Parent' || userType === 'Teacher'){
        if (platform === 'mobile') {
            throw new Error("Only students can sign in on mobile");
        }
    }

    return event;
};
