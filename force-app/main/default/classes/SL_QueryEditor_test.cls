@isTest
public class SL_QueryEditor_test {

    @isTest
    public static void getAllObjectsFromOrg_test() {
        List<EntityDefinition> lstEntities = [SELECT QualifiedApiName   
                                                FROM EntityDefinition 
                                                WHERE IsCustomSetting = false and IsQueryable = true 
                                                ORDER BY QualifiedApiName ];
        
        String returnedResult = SL_QueryEditor.getAllObjectsFromOrg();
        List<String> lstEntityNames = (List<String>) JSON.deserialize(returnedResult, List<String>.class);

        System.assertEquals(lstEntityNames.size(), lstEntities.size());
    }

    @isTest
    public static void getObjectRecords_test(){

        String nameOfObject = 'Account';
        String whereCondition = ' Name != null ';
        Integer limitCount = 10;
        Account acc = (Account)SL_TestDataFactoryNew.createSObject(new Account(), 'SL_TestDataFactoryNew.AccountDefaults');
        insert acc;
        
        SL_QueryEditor.selectedFieldWrapper wrapper = new SL_QueryEditor.selectedFieldWrapper('Name', 'Name');

        String returnedResult = SL_QueryEditor.getObjectRecords(JSON.serialize(new List<SL_QueryEditor.selectedFieldWrapper>{wrapper}),
                                     nameOfObject, whereCondition, String.valueOf(limitCount));
        List<sObject> deserialize =  (List<sObject>) JSON.deserialize(returnedResult, List<sObject>.class);

        String query = 'SELECT Name FROM ' + nameOfObject + ' WHERE ' + whereCondition + ' LIMIT ' + limitCount;  
        List<sObject> expectedResult =  Database.query(query);

        System.assertEquals(deserialize, expectedResult);
    }

    @isTest
    public static void getObjectFields_test(){
        
        String returnedResult = SL_QueryEditor.getObjectFields('Account');

        Map<String, Schema.SObjectField> mapAllobjectFields = 
                Schema.getGlobalDescribe().get('Account').getDescribe().fields.getMap();
        
        List<SL_QueryEditor.FieldWrapper> wrapper = new List<SL_QueryEditor.FieldWrapper>();
        for(String s : mapAllobjectFields.keySet()) {
            SL_QueryEditor.FieldWrapper field = new SL_QueryEditor.FieldWrapper(
                mapAllobjectFields.get(s).getDescribe().getName(),
                mapAllobjectFields.get(s).getDescribe().getType(),
                mapAllobjectFields.get(s).getDescribe().getLabel()
            );
            wrapper.add(field);
        }
        
        System.assertEquals(returnedResult, JSON.serialize(wrapper));
    }
}
