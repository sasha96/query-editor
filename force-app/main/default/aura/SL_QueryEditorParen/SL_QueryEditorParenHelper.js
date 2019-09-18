({
    changeObject: function (component, event, helper) {

        component.set('v.lstSelectedFields', '');
        component.set('v.strAllFields', '');
        component.set('v.options', '');

        var isUpdateLable = component.get('v.isUpdateLable');
        component.set('v.isUpdateLable', !isUpdateLable);

        var selectedObject = component.get('v.selectedObject');
        if (selectedObject && selectedObject !== null && selectedObject !== undefined) {

            var action = component.get("c.getObjectFields");
            action.setParams({
                'objName': selectedObject
            });
            action.setCallback(this, function (response) {
                if (response.getState() == "SUCCESS") {

                    var currentObject = response.getReturnValue();
                    var deserialize = JSON.parse(currentObject);

                    var listOfFields = [];
                    for (var field in deserialize) {
                        listOfFields.push(deserialize[field]);
                    }

                    var newlistOfFields = this.sortFields(listOfFields);
                    component.set("v.options", newlistOfFields);
                    component.set("v.isAllSelected", false);
                } else {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error Message',
                        message: 'Error happend in changeObject method',
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
    },

    sortFields: function (lstRecords) {

        var newList = lstRecords.sort(function (a, b) {
            if (a.label > b.label) {
                return 1;
            }
            if (a.label < b.label) {
                return -1;
            }
            return 0;
        });
        return newList;
    }
})
