import { LightningElement, api, track } from 'lwc';
import getAllObjectsFromOrg from "@salesforce/apex/SL_QueryEditor.getAllObjectsFromOrg";
import getObjectRecords from "@salesforce/apex/SL_QueryEditor.getObjectRecords";
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class QueryEditor extends NavigationMixin(LightningElement) {

    @track isShowPicklist = false;
    @track pickListDefValue = 'Select object';
    @track recordsLimit = 3;
    @track lstEntities = '';
    @track emptyResult = 'There is no records due to your search ...';
    @track disableCompare = false;
    @track listSelectedRecords;
    @track nameOfTable = this.pickListDefValue + ' table';
    @track listRecords;
    @track listHeaderItems = [];
    @track limitValue = 10;
    @track whereCondition = '';
    @track limitError = 'Please add a limit of records due to increasing Salesforce performance';

    @api showSpinner = false;
    @api strAllFields;
    @api lstSelectedFields = '';
    @api selectedObjectFromPicklist = false;
    @api selectedObject;
    @api selectedObjectSearch;
    @api selectedObjectPicklist;
    @track classTableNameDef = 'slds-table slds-table_bordered slds-table_cell-buffer slds-table_col-bordered slds-table_striped';
    @track classTableName = '';

    connectedCallback() {
        this.disableCompare = true;
        this.selectedObjectFromPicklist = false;

        getAllObjectsFromOrg()
            .then(result => {
                var deserialize = JSON.parse(result);
                var listOfEntities = [];
                for (var item in deserialize) {
                    listOfEntities.push({
                        value: deserialize[item],
                        label: deserialize[item]

                    });
                }

                this.lstEntities = listOfEntities;
                this.searchFromValue = this.searchFromValueDefault + this.pickListDefValue;
                this.isShowPicklist = true;
            })
            .catch(error => {
                this.showToastMessage('error', 'Error happend when you tried to get All Objects From Org' + error, 'error', 5000);
            })
    }


    changePicklist(event) {
        var selectedType = event.detail.value;
        this.searchFromValue = this.searchFromValueDefault + selectedType;
        this.nameOfTable = selectedType + ' table';
        this.selectedObjectPicklist = selectedType;

        if (this.selectedObjectFromPicklist) {
            this.selectedObject = this.selectedObjectPicklist;
        }

        this.dispatchEvent(new CustomEvent('changevaluefromsearch', {
            detail: {
                value: this.selectedObjectFromPicklist,
                nameObject: this.selectedObjectPicklist
            }
        }));
    }

    executeQuery(event) {

        var lstSelectedFields = this.lstSelectedFields;
        var selectedObject = this.selectedObjectFromPicklist ? this.selectedObjectPicklist : this.selectedObjectSearch;
        var whereCondition = this.whereCondition;
        var limitValue = this.limitValue;
        this.disableCompare = true;
        this.showSpinner = true;

        this.isMoreThan9Fields = false;
        getObjectRecords({
            lstSelectedFields: JSON.stringify(lstSelectedFields),
            selectedObject: selectedObject,
            whereCondition: whereCondition,
            limitValue: limitValue
        })
            .then(result => {

                var deserialize = JSON.parse(result);

                if (deserialize.length > 0) {

                    this.classTableName = this.classTableNameDef;
                    this.classTableName += this.lstSelectedFields.length > 9 ? ' additional-table-main-class ' : '';

                    var listHeaderItems = [];
                    for (var fil in this.lstSelectedFields) {
                        listHeaderItems.push({
                            label: this.lstSelectedFields[fil].Name
                        })
                    }
                    var prepareList = [];

                    for (var record in deserialize) {
                        var onerec = [];
                        var recordId = deserialize[record].Id;

                        for (var fil in this.lstSelectedFields) {

                            var fieldValue = deserialize[record][this.lstSelectedFields[fil].ApiName];

                            if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                                fieldValue == ' ';
                            }

                            var objectValues = '';
                            if (typeof fieldValue === 'object') {
                                for (var inn2 in fieldValue) {
                                    if (fieldValue[inn2] !== null) {
                                        objectValues += fieldValue[inn2] + '; ';
                                    }
                                }
                            }

                            onerec.push({
                                nameOfField: objectValues !== '' ? objectValues : fieldValue
                            })
                        }
                        prepareList.push({
                            record: onerec,
                            isChecked: false,
                            recordId: recordId
                        });
                    }

                    this.listRecords = prepareList;
                    this.listHeaderItems = listHeaderItems;
                } else {
                    this.listRecords = '';
                }
                this.showSpinner = false;
            })
            .catch(error => {
                this.showToastMessage('error', 'Error happend when you tried to execute Query' + error, 'error', 5000);
            })
    }

    handleCheckboxChange(event) {

        var selectedId = event.target.dataset.id;

        var prepareList = this.listRecords;

        var isSelectedAtLeastOne = false;

        for (var record in prepareList) {

            if (selectedId === prepareList[record].recordId) {
                prepareList[record].isChecked = !prepareList[record].isChecked;
            }

            if (prepareList[record].isChecked) {
                isSelectedAtLeastOne = true;
            }
        }

        this.disableCompare = isSelectedAtLeastOne ? false : true;
    }

    compareRecords(event) {

        this.showSpinner = true;
        var listRecords = this.listRecords;
        var newListToCompare = [];

        for (var record in listRecords) {
            if (listRecords[record].isChecked) {
                newListToCompare.push(listRecords[record]);
            }
        }

        this.listRecords = newListToCompare;
        this.showSpinner = false;
    }

    handlePicklist(event) {

        this.selectedObjectFromPicklist = !this.selectedObjectFromPicklist;
        this.dispatchEvent(new CustomEvent('changevaluefromsearch', {
            detail: {
                value: this.selectedObjectFromPicklist,
                nameObject: this.selectedObjectPicklist
            }
        }));


        if (this.selectedObjectFromPicklist) {
            this.selectedObject = this.selectedObjectPicklist;
        }
    }

    whereConditionHandler(event) {
        this.whereCondition = event.detail.value;
    }

    limitHandler(event) {
        this.limitValue = event.detail.value;
    }

    /* show toast message */
    showToastMessage(title, message, variant, duration, mode) {

        var toastEvnt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            duration: duration,
            mode: mode
        });
        this.dispatchEvent(toastEvnt);

    }
}