import { LightningElement, api, track } from 'lwc';
import getAllObjectsFromOrg from "@salesforce/apex/SL_QueryEditor.getAllObjectsFromOrg";
import getObjectRecords from "@salesforce/apex/SL_QueryEditor.getObjectRecords";
import { NavigationMixin } from 'lightning/navigation';
export default class QueryEditor extends NavigationMixin(LightningElement) {
    @track isShowPicklist = false;
    @track pickListDefValue = 'Select object';
    @track recordsLimit = 3;
    @track lstEntities = '';
    @track searchValueDefault = "SELECT id, Name, LastModifiedDate, LastModifiedBy.Name, CreatedDate, CreatedBy.Name ";
    @track searchFromValueDefault = " FROM ";
    @track searchFromValue;
    @track searchValue = "";
    @track searchValueToShow = "";
    @track emptyQueryField = 'Pleas type your query here'
    @track emptyResult = 'There is no records due to your search ...';

    @track disableCompare = false;
    @track listSelectedRecords;
    @track nameOfTable = this.pickListDefValue + ' table';
    @track listRecords;
    @track listHeaderItems = [
        {
            'label': 'Record Id',
            'value': 'id'
        },
        {
            'label': 'Name',
            'value': 'Name'
        },
        {
            'label': 'Last Modified Date',
            'value': 'LastModifiedDate'
        },
        {
            'label': 'Last Modified By',
            'value': 'LastModifiedBy.Name'
        },
        {
            'label': 'Created Date',
            'value': 'CreatedDate'
        },
        {
            'label': 'Created By ',
            'value': 'CreatedBy.Name'
        }
    ];

    @api strAllFields;
    @api lstSelectedFields = '';
    @api selectedObjectFromPicklist = false;
    @api selectedObject;
    @api selectedObjectSearch;
    @api selectedObjectPicklist;
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
                this.searchValueToShow = ' LIMIT ' + this.recordsLimit
                this.searchFromValue = this.searchFromValueDefault + this.pickListDefValue;
                this.searchValue = this.searchValueDefault + this.searchFromValue + this.searchValueToShow;

                this.isShowPicklist = true;
                //this.executeQuery();
            })
            .catch(error => {
                console.log(error);
            })
    }


    changePicklist(event) {
        var selectedType = event.detail.value;
        this.searchValueToShow = ' LIMIT ' + this.recordsLimit;
        this.searchFromValue = this.searchFromValueDefault + selectedType;
        this.searchValue = this.searchValueDefault + this.searchFromValue + this.searchValueToShow;
        this.nameOfTable = selectedType + ' table';

        this.selectedObjectPicklist = selectedType;
        if (this.selectedObjectFromPicklist) {
            this.selectedObject = this.selectedObjectPicklist;
        }

        //if (this.selectedObjectFromPicklist) {
        this.dispatchEvent(new CustomEvent('changevaluefromsearch', {
            detail: {
                value: this.selectedObjectFromPicklist,
                nameObject: this.selectedObjectPicklist
            }
        }));
        //}
    }

    searchHandler(event) {
        this.searchValue = this.searchValueDefault + this.searchFromValue + ' ' + event.detail.value;
    }

    executeQuery(event) {

        getObjectRecords({
            query: this.searchValue
        })
            .then(result => {

                var deserialize = JSON.parse(result);

                if (deserialize.length > 0) {
                    var prepareList = [];
                    for (var record in deserialize) {
                        prepareList.push({
                            'Id': deserialize[record].Id,
                            'Name': deserialize[record].Name,
                            'LastModifiedDate': this.formatDatehelper(new Date(deserialize[record].LastModifiedDate)),
                            'LastModifiedBy': deserialize[record].LastModifiedBy,
                            'CreatedDate': this.formatDatehelper(new Date(deserialize[record].CreatedDate)),
                            'CreatedBy': deserialize[record].CreatedBy,
                            'isChecked': false
                        });
                    }

                    this.listRecords = prepareList;
                } else {
                    this.listRecords = '';
                }
            })
            .catch(error => {
                console.log(error);
            })
    }

    formatDatehelper(date) {

        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;

    }

    openRecord(event) {
        var selectedId = event.target.dataset.id;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: selectedId,
                actionName: 'view'
            }
        });
    }

    navigateToRecordViewPageByUser(event) {
        var selectedId = event.target.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: selectedId,
                objectApiName: 'User',
                actionName: 'view'
            }
        });

    }

    navigateToRecordViewPageInNewTab(event) {
        var selectedId = event.target.dataset.id2;
        window.open('/' + selectedId, '_blank');
    }

    handleCheckboxChange(event) {

        var selectedId = event.target.dataset.id;

        var prepareList = this.listRecords;

        var prepareSelectedItems = [];

        for (var record in prepareList) {

            if (selectedId === prepareList[record].Id) {
                prepareList[record].isChecked = !prepareList[record].isChecked;
            }
            if (prepareList[record].isChecked) {
                prepareSelectedItems.push({
                    recordId: prepareList[record].Id
                })
            }
        }

        this.listRecords = prepareList;

        if (prepareSelectedItems.length > 0) {
            this.listSelectedRecords = prepareSelectedItems;
        } else {
            this.listSelectedRecords = '';
        }

        this.disableCompare = this.listSelectedRecords.length > 0 ? false : true;
    }

    compareRecords(event) {

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
}