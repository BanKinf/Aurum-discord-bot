//Split Dimension Function
function shortString(string) {
    string = string.replace("minecraft:", "");
    string = string.replace("_", " ");
    if (string.startsWith("the ")) {
        string = string.slice(4);
    }
    return string;
}

module.exports = shortString;