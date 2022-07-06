
const select = document.getElementById('type-select');

// on select change, disable and hide the inputs of the unrelevant types, and show and enable the relevant ones
select.addEventListener('change', function handleChange(event) {
    let newType = event.target.value;
    let paramsDivIds = ["tv-params", "radio-params", "oven-params", "fridge-params", "door-params"];
    let idToShow = newType + "-params";

    // hide others
    let divsToHide = paramsDivIds.filter(id => id != idToShow)
                                  .map(id => document.getElementById(id));

    divsToHide = Array.from(divsToHide).filter(div => div != null);
    console.log('divsToHide :', divsToHide);
    divsToHide.forEach(function(div) {
        div.classList.add("d-none"); // add display none
        // disable all disabled inputs 
        Array.from(div.querySelectorAll("input, select"))
            .map(elem => { 
                elem.setAttribute("disabled", "") 
            });
    });

    // show relevant type inputs
    let divToShow = document.getElementById(idToShow);
    divToShow.classList.remove("d-none"); // remove displayNone
    Array.from(divToShow.querySelectorAll("input, select"))
            .map(elem => elem.removeAttribute("disabled"));
});
