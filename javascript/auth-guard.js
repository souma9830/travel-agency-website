(function () {
    const token = localStorage.getItem("token");
    const publicPages = ["login.html", "signup.html", "forgot-password.html", "reset-password.html", "reset-success.html"];
    const pathParts = window.location.pathname.split("/");
    const currentPage = pathParts.pop() || "index.html";
    const isInHtmlFolder = pathParts.includes("html");

    const normalizedPage = (currentPage === "" || currentPage === "Travel%20agency") ? "index.html" : currentPage;

    if (!token && !publicPages.includes(normalizedPage)) {
        const prefix = isInHtmlFolder ? "../" : "";
        window.location.href = prefix + "login.html";
    } else if (token && publicPages.includes(normalizedPage)) {
        const prefix = isInHtmlFolder ? "../" : "";
        window.location.href = prefix + "index.html";
    }
})();
