({
    onRender: function (component, event, helper) {

        if (!component.get("v.initializationCompleted")) {
            component.getElement().addEventListener("click", function (event) {
                helper.handleClick(component, event, 'component');
            });
            document.addEventListener("click", function (event) {
                helper.handleClick(component, event, 'document');
            });
            component.set("v.initializationCompleted", true);
            helper.setPickListName(component, component.get("v.selectedOptions"));
        }

    },

    onInputChange: function (component, event, helper) {

        var inputText = event.target.value;
        helper.filterDropDownValues(component, inputText);
    },

    onRefreshClick: function (component, event, helper) {

        component.set("v.selectedOptions", []);
        helper.rebuildPicklist(component);
        helper.setPickListName(component, component.get("v.selectedOptions"));
    },

    onClearClick: function (component, event, helper) {

        component.getElement().querySelector('#ms-filter-input').value = '';
        helper.resetAllFilters(component);
    },

    updateLabel: function (component, event, helper) {

        component.set("v.selectedLabel", component.get("v.msname"));
        component.set('v.selectedOptions', []);
    },

    selectAllFields: function (component, event, helper) {

        var isAllSelected = component.get('v.isAllSelected');
        if (!isAllSelected) {
            var allFields = component.get('v.msoptions');
            for (var item in allFields) {
                allFields[item].selected = true;
            }
            component.set('v.msoptions', allFields);

            var newList = [];
            for (var field in allFields) {
                newList.push({
                    "ApiName": allFields[field].apiName,
                    "Name": allFields[field].label
                });
            }
            component.set('v.selectedOptions', newList);
            helper.throwEventToParent(component);
            component.set('v.selectedLabel', newList.length + ' Options Selected');

        } else {
            var allFields = component.get('v.msoptions');
            for (var item in allFields) {
                allFields[item].selected = false;
            }
            component.set('v.msoptions', allFields);
            component.set('v.selectedOptions', []);
            helper.throwEventToParent(component);
            component.set("v.selectedLabel", component.get("v.msname"));
        }
        component.set('v.isAllSelected', !isAllSelected);
    }

})