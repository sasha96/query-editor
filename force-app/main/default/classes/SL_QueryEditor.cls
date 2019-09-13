public class SL_QueryEditor {
    
    @AuraEnabled
    public static String getAllObjectsFromOrg(){
        
        List<EntityDefinition> lstEntities = [SELECT QualifiedApiName   
                                                FROM EntityDefinition 
                                                WHERE IsCustomSetting = false and IsQueryable = true 
                                                ORDER BY QualifiedApiName ];

        List<String> lstEntityNames = new List<String>();
        for(integer i = 0; i < lstEntities.size(); i ++){
            lstEntityNames.add(lstEntities[i].QualifiedApiName);
        }

        if(lstEntityNames.size() > 0 ){
            return JSON.serialize(lstEntityNames);
        }

        throw new QueryEditorException('Error happend when you tried to retrieve all Entities. Please contact your Administration');
    }

    @AuraEnabled
    public static String getObjectRecords(String query){
        List<sObject> records = Database.query(query);
        return JSON.serialize(records);
    }

    @AuraEnabled
    public static String getObjectFields(String objName){
        
        Map<String, Schema.SObjectField> mapAllobjectFields = 
                Schema.getGlobalDescribe().get(objName).getDescribe().fields.getMap();

        List<FieldWrapper> wrapper = new List<FieldWrapper>();
        for(String s : mapAllobjectFields.keySet()) {
            FieldWrapper field = new FieldWrapper(
                mapAllobjectFields.get(s).getDescribe().getName(),
                mapAllobjectFields.get(s).getDescribe().getType(),
                mapAllobjectFields.get(s).getDescribe().getLabel()
            );
            wrapper.add(field);
        }
        return JSON.serialize(wrapper);
    }

    public class FieldWrapper {
        public String apiName 	{get;set;}
        public Object type 	    {get;set;}
        public String label	    {get;set;} 

        public FieldWrapper(String apiName, Object type, String label){
            this.apiName = apiName;
            this.type = type;
            this.label = label;
        }
    }

    public class QueryEditorException extends Exception {}
}