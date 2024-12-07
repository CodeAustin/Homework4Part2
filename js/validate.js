$(document).ready(function () {
    const tabValues = {}; // Store slider and table values for each tab
    // Add a new tab
    $("#add-tab").on("click", function () {
        const tabCount = $("#tabs ul li").length + 1;
        const tabId = `tab-${tabCount}`;

        // Use current form values instead, will use 0 5 0 5 as default values
        const minCol = parseInt($("#minCol").val()) || 0;
        const maxCol = parseInt($("#maxCol").val()) || 5;
        const minRow = parseInt($("#minRow").val()) || 0;
        const maxRow = parseInt($("#maxRow").val()) || 5;

        // Store the current form values for the new tab
        tabValues[tabId] = { minCol, maxCol, minRow, maxRow };

        // Add tab label and content to the DOM
        $("#tabs ul").append(
            `<li><a href="#${tabId}">Tab ${tabCount}</a><button class="delete-tab">x</button></li>`
        );

        // Add tab content to the DOM
        $("#tabs").append(
            `<div id="${tabId}" class="tab-content"><div class="table-container"></div></div>`
        );

        $("#tabs").tabs("refresh");
        $(`#tabs ul li:last-child a`).click();

        // Immediately generate the table for the new tab with current values
        updateTable();
    });

    // Slider and input field initialization
    initSlider("#minColSlider", "#minCol", -50, 50, "#maxCol", true);
    initSlider("#maxColSlider", "#maxCol", -50, 50, "#minCol", false);
    initSlider("#minRowSlider", "#minRow", -50, 50, "#maxRow", true);
    initSlider("#maxRowSlider", "#maxRow", -50, 50, "#minRow", false);

    // Dynamic slider and input field initialization
    // Reference: https://api.jqueryui.com/slider/
    // Inspired by: https://stackoverflow.com/questions/8795431/how-do-i-dynamically-change-min-max-values-for-jquery-ui-slider
    function initSlider(sliderId, inputId, min, max, otherInputId, isMinSlider) {
        $(sliderId).slider({
            range: "min",
            min: min,
            max: max,
            value: $(inputId).val(),

            // Update the input field value when the slider is moved
            slide: function (event, ui) {
                const otherValue = parseInt($(otherInputId).val());
                if (isMinSlider && ui.value >= otherValue) return false;
                if (!isMinSlider && ui.value <= otherValue) return false;
                $(inputId).val(ui.value);
                updateTable();
            }
        });

        // Update the slider value when the input field is changed
        $(inputId).on("input", function () {
            let value = parseInt($(this).val());
            // Validate the input value (jQuery validation plugin didnt work not used here)
            if (value < min || value > max || (isMinSlider && value >= $(otherInputId).val()) || (!isMinSlider && value <= $(otherInputId).val())) {
                $(this).val($(sliderId).slider("value"));
            } else {
                $(sliderId).slider("value", value);
                updateTable();
            }
        });
    }

    // Update the table based on the input values
    function updateTable() {
        if (!$("#numberForm").valid()) return;

        // Get the active tab and input values, taken from
        // Reference: https://api.jqueryui.com/tabs/#option-active
        const activeTabId = $("#tabs .ui-tabs-active a").attr("href").replace("#", "");
        const minCol = parseInt($("#minCol").val());
        const maxCol = parseInt($("#maxCol").val());
        const minRow = parseInt($("#minRow").val());
        const maxRow = parseInt($("#maxRow").val());

        // Store the input values for the active tab
        tabValues[activeTabId] = { minCol, maxCol, minRow, maxRow };

        // Generate the multiplication table
        let table = '<table><tr><th id="blankCell"></th>';
        for (let col = minCol; col <= maxCol; col++) {
            table += `<th id="colHeader">${col}</th>`;
        }
        table += '</tr>';

        for (let row = minRow; row <= maxRow; row++) {
            table += `<tr><th id="rowHeader">${row}</th>`;
            for (let col = minCol; col <= maxCol; col++) {
                table += `<td id="value">${row * col}</td>`;
            }
            table += '</tr>';
        }
        table += '</table>';

        
        $(`#${activeTabId} .table-container`).html(table);
    }

    // Load the input values for the selected tab
    // Reference: https://api.jquery.com/trigger/
    // jQuery trigger() method is used to since trying to fit everything 
    // to validate was not working. This is fine. ;-;
    function loadTabValues(tabId) {
        const values = tabValues[tabId];
        if (!values) return;
        $("#minCol").val(values.minCol).trigger("input");
        $("#maxCol").val(values.maxCol).trigger("input");
        $("#minRow").val(values.minRow).trigger("input");
        $("#maxRow").val(values.maxRow).trigger("input");
    }

    // Delete a tab and its associated table
    function deleteTab(tabId) {
        $(`#${tabId}`).remove(); // Remove tab content
        $(`#tabs ul li a[href="#${tabId}"]`).parent().remove(); // Remove tab label
        $("#tabs").tabs("refresh"); // Refresh tabs UI

        // Activate the first available tab if any
        if ($("#tabs ul li").length > 0) {
            $("#tabs ul li:first-child a").click();
        }
    }

    // Form validation shortened version (doesn't work due to slider inputs)
    $("#numberForm").validate({
        rules: {
            minCol: { required: true, number: true, range: [-50, 50] },
            maxCol: { required: true, number: true, range: [-50, 50] },
            minRow: { required: true, number: true, range: [-50, 50] },
            maxRow: { required: true, number: true, range: [-50, 50] }
        },
        submitHandler: function () {
            updateTable();
        }
    });




    // Event listener for deleting tabs
    // Reference: https://api.jqueryui.com/tabs/#event-activate
    // Inspired by: https://stackoverflow.com/questions/15090942/event-handler-not-working-on-dynamic-content
    $("#tabs").on("click", ".delete-tab", function () {
        const tabId = $(this).prev("a").attr("href").replace("#", "");
        deleteTab(tabId);
    });

    $("#tabs").on("tabsactivate", function (event, ui) {
        const tabId = ui.newPanel.attr("id");
        loadTabValues(tabId);
    });

    $("#tabs").tabs();
});
