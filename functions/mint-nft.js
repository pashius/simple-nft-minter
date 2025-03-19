export const handler = async (event) => {
    console.log("Function invoked with event:", event);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Function is working!" })
    };
};
