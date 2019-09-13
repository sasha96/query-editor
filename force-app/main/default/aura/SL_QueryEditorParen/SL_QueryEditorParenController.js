({
    doInit: function (component, event, helper) {
        component.set('v.lstSelectedFields', null);
        /*const options = [
            { 'Id': 1, 'Name': 'Jaipur' },
            { 'Id': 2, 'Name': 'Pune' },
            { 'Id': 3, 'Name': 'Hyderabad' },
            { 'Id': 4, 'Name': 'Banglore' },
            { 'Id': 5, 'Name': 'Gurgaon' },
            { 'Id': 6, 'Name': 'Mumbai' },
            { 'Id': 7, 'Name': 'Chennai' },
            { 'Id': 8, 'Name': 'Noida' },
            { 'Id': 9, 'Name': 'Delhi' },
        ];
        component.set("v.options", options);*/
    },

    handlePicklist: function (component, event, helper) {

        var isSearchMode = component.get('v.isSearchMode');

        var selectedObjectPicklist = component.get('v.selectedObjectPicklist');
        var selectedObjectSearch = component.get('v.selectedObjectSearch');

        if (isSearchMode) {
            component.set('v.selectedObject', selectedObjectSearch);
        } else {
            component.set('v.selectedObject', selectedObjectPicklist);
        }

        component.set('v.lstSelectedFields', '');
        component.set('v.strAllFields', '');
        helper.changeObject(component, event, helper);
    },

    changevaluefromsearchHandler: function (component, event, helper) {
        /*component.set('v.lstSelectedFields', '');
        component.set('v.strAllFields', '');*/

        var value = event.getParam('value');
        if (!value && !component.get('v.isSearchMode')) {

        } else {

            component.set('v.isSearchMode', !value);
            var nameObject = event.getParam('nameObject');
            component.set('v.selectedObjectPicklist', nameObject);

            var isSearchMode = component.get('v.isSearchMode');

            var selectedObjectPicklist = component.get('v.selectedObjectPicklist');
            var selectedObjectSearch = component.get('v.selectedObjectSearch');

            if (isSearchMode) {
                //helper.changeObject(component);
                component.set('v.selectedObject', selectedObjectSearch);
            } else {

                component.set('v.selectedObject', selectedObjectPicklist);
            }
        }

    },

    handleEventNewObject: function (component, event, helper) {
        var lstSelectedFields = event.getParam('lstSelectedFields');
        if (lstSelectedFields) {
            component.set('v.lstSelectedFields', lstSelectedFields);

            var strAllFields = '';

            for (var i = 0; i < lstSelectedFields.length; i++) {
                strAllFields += lstSelectedFields[i].Name;
                if (i < lstSelectedFields.length - 1) {
                    strAllFields += ', '
                }
            }
            component.set('v.strAllFields', strAllFields);
        } else {

            var selectedName = event.getParam('nameSelectedObject');
            component.set('v.selectedObjectSearch', selectedName);

            var isSearchMode = component.get('v.isSearchMode');
            if (isSearchMode) {
                component.set('v.selectedObject', component.get('v.selectedObjectSearch'));
            }
        }
        //helper.changeObject(component);
    },

    changeObject: function (component, event, helper) {

        var isSearchMode = component.get('v.isSearchMode');
        if (!isSearchMode)
            helper.changeObject(component, event, helper);
    }
})
