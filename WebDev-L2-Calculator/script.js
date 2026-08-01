const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

let currentInput = "";

buttons.forEach(button => {

    button.addEventListener("click", () => {

        let value = button.textContent;

        if (value === "C") {
            currentInput = "";
            display.value = "";
        }

        else if (value === "DEL") {
            currentInput = currentInput.slice(0, -1);
            display.value = currentInput;
        }

        else if (value === "=") {

            try {

                let expression = currentInput
                    .replaceAll("×", "*")
                    .replaceAll("÷", "/")
                    .replaceAll("−", "-");

                if (expression.includes("/0")) {
                    display.value = "Error";
                    currentInput = "";
                    return;
                }

                let result = eval(expression);

                display.value = result;
                currentInput = result.toString();

            }

            catch {
                display.value = "Error";
                currentInput = "";
            }

        }

        else {

            currentInput += value;
            display.value = currentInput;

        }

    });

});