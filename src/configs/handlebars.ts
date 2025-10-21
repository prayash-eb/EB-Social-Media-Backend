import Handlebars from "handlebars";

export const initHandleBars = () => {
    Handlebars.registerHelper("uppercase", (str: string) => str?.toUpperCase());
    Handlebars.registerHelper("capitalize", (str: string) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1) : ""
    );
    Handlebars.registerHelper("formatDate", (date: string) => new Date(date).toLocaleDateString());
    return Handlebars;
};
