({
    closeAllDropDown: function () {

        Array.from(document.querySelectorAll('#ms-picklist-dropdown')).forEach(function (node) {
            node.classList.remove('slds-is-open');
        });
    },

    onDropDownClick: function (dropDownDiv) {

        var classList = Array.from(dropDownDiv.classList);
        if (!classList.includes("slds-is-open")) {
            this.closeAllDropDown();
            dropDownDiv.classList.add('slds-is-open');
        } else {
            this.closeAllDropDown();
        }
    },

    handleClick: function (component, event, where) {

        var tempElement = event.target;
        var outsideComponent = true;

        while (tempElement) {
            if (tempElement.id === 'ms-list-item') {
                if (where === 'component') {
                    this.onOptionClick(component, event.target);
                }
                outsideComponent = false;
                break;
            } else if (tempElement.id === 'ms-dropdown-items') {
                outsideComponent = false;
                break;
            } else if (tempElement.id === 'ms-picklist-dropdown') {
                if (where === 'component') {
                    this.onDropDownClick(tempElement);
                }
                outsideComponent = false;
                break;
            }
            tempElement = tempElement.parentNode;
        }
        if (outsideComponent) {
            this.closeAllDropDown();
        }
    },

    rebuildPicklist: function (component) {

        var allSelectElements = component.getElement().querySelectorAll("li");
        Array.from(allSelectElements).forEach(function (node) {
            node.classList.remove('slds-is-selected');
        });
    },

    filterDropDownValues: function (component, inputText) {

        var allSelectElements = component.getElement().querySelectorAll("li");
        Array.from(allSelectElements).forEach(function (node) {
            if (!inputText) {
                node.style.display = "block";
            }
            else if (node.dataset.name.toString().toLowerCase().indexOf(inputText.toString().trim().toLowerCase()) != -1) {
                node.style.display = "block";
            } else {
                node.style.display = "none";
            }
        });
    },

    resetAllFilters: function (component) {
        this.filterDropDownValues(component, '');
        this.throwEventToParent(component);
    },

    setPickListName: function (component, selectedOptions) {

        const maxSelectionShow = component.get("v.maxSelectedShow");
        if (selectedOptions.length < 1) {
            component.set("v.selectedLabel", component.get("v.msname"));
        } else if (selectedOptions.length > maxSelectionShow) {
            component.set("v.selectedLabel", selectedOptions.length + ' Options Selected');
        } else {
            var selections = '';
            selectedOptions.forEach(option => {
                selections += option.Name + ',';
            });
            component.set("v.selectedLabel", selections.slice(0, -1));
        }
    },

    onOptionClick: function (component, ddOption) {

        var clickedValue = {
            "ApiName": ddOption.closest("li").getAttribute('data-ApiName'),
            "Name": ddOption.closest("li").getAttribute('data-name')
        };
        var selectedOptions = component.get("v.selectedOptions");
        var alreadySelected = false;
        selectedOptions.forEach((option, index) => {
            if (option.ApiName === clickedValue.ApiName) {
                selectedOptions.splice(index, 1);
                alreadySelected = true;
                ddOption.closest("li").classList.remove('slds-is-selected');
            }
        });
        if (!alreadySelected) {
            selectedOptions.push(clickedValue);
            ddOption.closest("li").classList.add('slds-is-selected');
        }
        this.setPickListName(component, selectedOptions);
        this.throwEventToParent(component);

        var selectedOptions = component.get('v.selectedOptions');
        var msoptions = component.get('v.msoptions');
        if (msoptions.length != selectedOptions.length) {
            component.set('v.isAllSelected', false);
        } else {
            component.set('v.isAllSelected', true);
        }
    },

    throwEventToParent: function (component) {

        var newEvent = component.getEvent("newSelectedObject");
        newEvent.setParam("lstSelectedFields", component.get('v.selectedOptions'));
        newEvent.fire();
    }

})