({
    doInit: function (component, event, helper) {

        var iconParam = component.get('v.iconParam');
        var isEmptyIcon = iconParam === undefined ? true : false;
        component.set('v.isEmptyIcon', isEmptyIcon);

        var recordId = component.get("v.recordId");
        var searchField = component.get("v.searchField");
        var objectApiName = component.get("v.objApiName");

        if (recordId !== null && recordId && recordId !== '') {
            var action = component.get("c.getRecord");
            action.setParams({
                'recordId': recordId,
                'objectName': objectApiName,
                'mainField': searchField
            });
            action.setCallback(this, function (response) {
                if (response.getState() == "SUCCESS") {

                    var currentObject = response.getReturnValue();
                    var textField = currentObject[searchField];
                    var wrapperObject = { objName: textField };
                    component.set("v.selectedRecord", wrapperObject);
                } else {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error Message',
                        message: 'Error happend in init method',
                        duration: ' 5000',
                        key: 'info_alt',
                        type: 'error',
                        mode: 'pester'
                    });
                    toastEvent.fire();
                }
            });
            $A.enqueueAction(action);
        }

        var option = component.get("v.selectedRecord");
        if (!option) return;
        option.objName = option[searchField];
        component.set("v.selectedRecord", option);

    },

    setFocus: function (component, event, helper) {

        var focus = function () {
            component.set("v.isDropdownOpen", true);
        }
        var blur = function () {
            component.set("v.isDropdownOpen", false);
        }
        component.find('dropdownUtil').focus(focus, blur);

    },

    clearSearch: function (component, event, helper) {
        component.set("v.searchString", null);
    },

    doSearch: function (component, event, helper) {

        var searchString = component.get("v.searchString");

        if (searchString) {
            searchString = searchString.trim().replace(/\*/g).toLowerCase();
        }

        var objApiName = component.get("v.objApiName");
        var searchField = component.get("v.searchField");
        var searchTimeout = component.get('v.searchTimeout');
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        searchTimeout = window.setTimeout(
            $A.getCallback(() => {
                var action = component.get("c.search");
                action.setParams({
                    'searchString': searchString,
                    'objectName': objApiName,
                    'fields': searchField,
                    'soslParams': component.get('v.soslParams'),
                    'limitOfRecords': component.get('v.limitOfRecords')
                });
                action.setCallback(this, function (response) {
                    if (response.getState() == "SUCCESS") {

                        var lstRecords = response.getReturnValue().map(function (option) {

                            if (component.get('v.searchField').trim() === 'QualifiedApiName') {
                                option.objName = option.QualifiedApiName;
                            } else {
                                option.objName = option[searchField];
                            }
                            return option;
                        });
                        component.set("v.lstRecords", lstRecords);
                    } else {
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            title: 'Error Message',
                            message: 'Error happend in search method',
                            duration: ' 5000',
                            key: 'info_alt',
                            type: 'error',
                            mode: 'pester'
                        });
                        toastEvent.fire();
                    }
                });
                action.setStorable();
                $A.enqueueAction(action);
                component.set('v.searchTimeout', null);
            }),
            300
        );
        component.set('v.searchTimeout', searchTimeout);

    },

    selectOption: function (component, event, helper) {

        if (component.get('v.searchField').trim() === 'QualifiedApiName') {

            var objName = event.currentTarget.dataset.name;
            var lstRecords = component.get("v.lstRecords");
            var selected = lstRecords.filter(function (e) {
                return e.objName == objName;
            });

            component.set("v.selectedRecord", selected[0]);

            component.set("v.isEmpty", '');

            component.set("v.searchString", null);
            component.set("v.lstRecords", []);

            var newEvent = component.getEvent("newSelectedObject");
            newEvent.setParam("nameSelectedObject", selected[0].objName);
            newEvent.fire();

        } else {
            var id = event.currentTarget.dataset.id;
            var lstRecords = component.get("v.lstRecords");
            var selected = lstRecords.filter(function (e) {
                return e.Id == id;
            });
            component.set("v.recordId", id);
            component.set("v.selectedRecord", selected[0]);

            component.set("v.isEmpty", '');

            component.set("v.searchString", null);
            component.set("v.lstRecords", []);
        }
    },

    handleRemove: function (component, event, helper) {

        component.set("v.recordId", null);
        component.set("v.selectedRecord", null);
        if (component.get('v.searchField').trim() === 'QualifiedApiName') {
            var newEvent = component.getEvent("newSelectedObject");
            newEvent.setParam("nameSelectedObject", null);
            newEvent.fire();
        }
    },

})