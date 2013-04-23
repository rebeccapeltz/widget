 (function( $ ) {
        $.widget( "f5.optionlistbuilder", {
            options: {
            id: 'default',
                size: '3',
                inputValueWidth:'300',
                dependElementId :'depend_default',
                nameMap: {}, //use value of dependElementId to lookup list of names
                valueMap: {}, //use dependElementId + name to lookup list of values
                uniqueKey: false,
                onAfterAdd: function(valueAddedString){},
                onAfterDelete: function(valueDeletedString){}
            },
          
            NONE: "none",
            EMPTY_KEY : "",
            _dependElementValue:"",
            _nameObject:{},
            _valueObject:{},
            _valueList:[],


            _kvPair: function(key,value){
                var obj = {};
                obj.name = key ? key : '';
                obj.value = value ? value : '';
                return obj;
            },
            _kvPairJsonString: function(key,value){
                return JSON.stringify(this._kvPair(key,value));
            },
             _kvPairJsonString: function(key,value){
                return JSON.stringify(this._kvPair(key,value));
            },
            _clearSelected: function(selectElement){
                $(selectElement).find('option').each(function(){
                   $(this).removeAttr("selected");
                });
             },
            _updateHiddenInput: function(that){
                var hiddenArray=[];
                $("#"+that.options.id+"_kvlv_final_list > option").each(function() {
                    var valueObj = JSON.parse(this.value);
                    hiddenArray.push(valueObj);
                });
                $("#"+that.options.id + "_kvlv_hidden_input").val(JSON.stringify(hiddenArray));  
            },
            dependentElementValueChange: function(){
                this._init();
            },
            getHiddenValue: function(){
                return $("#"+ this.options.id + "_kvlv_hidden_input").val();
            },
            _init: function(){
                var that = this;
                
                //clear out input table, final list, hidden input
                $("#"+that.options.id + "_table_wrapper tr").remove();
                $("#"+that.options.id + "_kvlv_final_list").find('option').remove().end();
                $("#"+that.options.id + "_kvlv_hidden_input").val("{}");
                
                //if nameMap is not empty, you show each name with a value or select input
                //otherwise, you allow a single values input  TODO add single value input
                if (!jQuery.isEmptyObject(this.options.nameMap)){
                    var dependElementValue = $("#"+that.options.dependElementId).val();
                    var nameObj = that.options.nameMap[dependElementValue];
                    var nameList = nameObj["valueSelectList"];                  
                  
                    if (nameList.length > 0){
                        var tablewrapper = $("#"+that.options.id + "_table_wrapper");    
                        $.each(nameList, function(key,value) { 
                            var inputRow = $("<tr>")
                               .appendTo(tablewrapper),
                            labelCell = $("<td>")
                               .addClass("label")
                               .attr("id",that.options.id + "_label_" + key)
                               .text(value)
                               .appendTo(inputRow);                          
                            
                            var settingsCell = $("<td>")
                               .addClass("settings")
                               .appendTo(inputRow);
                               
                            //set required
                            //-- if name value in requiredValue list mark required
                            if ($.inArray(value,nameObj.requiredValueList) > -1){
                                $(labelCell).addClass("required");
                            }
                            
                            //select value list based on dependent element value and selected name value
                            var valueObject = that.options.valueMap[dependElementValue + value],
                            valueList = valueObject.valueSelectList;
                            //if there are values load options
                            //otherwise, allow user input
                            if (valueList.length > 0){
                                var idKey = key;
                                $("<select>")
                                    .attr("id", that.options.id + "_select_" + idKey)
                                    .appendTo(settingsCell);
                                $.each(valueList, function(key,value){
                                    $("#" + that.options.id + "_select_" + idKey)
                                        .append($("<option></option>")
                                        .attr("value",value)
                                        .text(value));
                                });
                            } else {
                                $("<input>")
                                .css("width",'350px')
                                .attr("id",that.options.id + "_input_" + key)
                                .appendTo(settingsCell);
                               
                                //determine type - if boolean set to true and disable
                                if (nameObj.type === 'boolean'){
                                    $("#"+that.options.id + "_input_" + key)
                                        .val("true")
                                        .prop('disabled',true);
                                }
                            }
                            
                            //ADD button
                            var buttonCell = $("<td>")
                               .appendTo(inputRow);
                            $('<input type="button" value="Add" >')
                               .appendTo(buttonCell)
                               .click(function(event) {
                                    var name = $(this)
                                        .closest('tr')
                                        .find('.label')
                                        .text();

                                    //look for input or select
                                    var inputValue = $(this)
                                        .closest('tr')
                                        .find('input')
                                        .not('input[type=button]')
                                        .val(),
                                    selectValue = $(this)
                                        .closest('tr')
                                        .find('select')
                                        .val(),
                                    value = inputValue ? inputValue :(selectValue ? selectValue : '');
                                    that._clearSelected($("#"+that.options.id+"_kvlv_final_list"));
                                    var currentHdnVal = JSON.parse($("#"+that.options.id + "_kvlv_hidden_input").val());
                                    
                                    //determine if key and key/val already used
                                    var keyInList =false,keyValInList = false;
                                    for (var i=0;i<currentHdnVal.length;i++){
                                        hdnName = currentHdnVal[i].name;
                                        hdnValue = currentHdnVal[i].value;
                                        keyInList = keyInList || (name === hdnName);
                                        if (name === hdnName && value === hdnValue){
                                           keyValInList = true;
                                           break;
                                        } 
                                    } 
                                    
                                    /*
                                        Name-Value will always be unique
                                        If 'uniqueKey' option set to true user will only be allowed to add name once - if they attempt a 
                                        second add, it will update and hilight the item in the list where the name already exists
                                    */
                                    if (keyValInList) {
                                        //hilight based on key/val
                                        var valStr = that._kvPairJsonString(name,value);
                                        $("#"+that.options.id+"_kvlv_final_list option[value='" + valStr +"']").attr("selected", "selected");  
                                    } else  if (that.options.uniqueKey && keyInList){ 
                                        //update select list
                                        $("#"+that.options.id+"_kvlv_final_list > option").each(function() {
                                           var valueObj = JSON.parse(this.value);
                                           if (valueObj.name === name){
                                               $(this).text(name + ' ' + value)
                                               $(this).val(that._kvPairJsonString(name,value));
                                               $(this).attr("selected","selected");
                                               return;
                                           }
                                        });
                                    } else {
                                        //just add to list
                                        $("#"+that.options.id+"_kvlv_final_list")
                                           .append($("<option></option>")
                                           .attr("value", that._kvPairJsonString(name,value))
                                           .attr("selected", "selected")
                                           .text(name + ' ' + value));
                                        
                                    }
                                    //events
                                    that.options.onAfterAdd(that._kvPairJsonString(name,value));
                                    
                                    //update hidden value 
                                    that._updateHiddenInput(that);
                                 
                               });
                               
                        });
                    }
                } else {  //single value entry no name (label)
                    var tablewrapper = $("#"+that.options.id + "_table_wrapper");    
                    var inputRow = $("<tr>")
                       .appendTo(tablewrapper);
                    
                    var settingsCell = $("<td>")
                       .addClass("settings")
                       .appendTo(inputRow);
                    $("<input>")
                       .css("width",'350px')
                       .attr("id",that.options.id + "_input")
                       .appendTo(settingsCell);
                    
                    //ADD button
                    var buttonCell = $("<td>")
                       .appendTo(inputRow);
                    $('<input type="button" value="Add" >')
                       .appendTo(buttonCell)
                       .click(function(event) {
                            var name="";//name is not relevant
                            //look for input or select
                            var inputValue = $(this)
                                .closest('tr')
                                .find('input')
                                .not('input[type=button]')
                                .val();
                            //refactor ?? TODO
                            value = inputValue;
                            that._clearSelected($("#"+that.options.id+"_kvlv_final_list"));
                            var currentHdnVal = JSON.parse($("#"+that.options.id + "_kvlv_hidden_input").val());
                            
                            //determine if value already used
                            var valInList = false;
                            for (var i=0;i<currentHdnVal.length;i++){
                                var hdnValue = currentHdnVal[i].value;
                                if (value === hdnValue){
                                   valInList = true;
                                   break;
                                } 
                            } 
                            
                            /*
                                Value will always be unique - if it exists it will be hilighted
                                'uniqueId' option ignored for single value entry
                            */
                            if (valInList) {
                                //hilight based on key/val
                                var valStr = that._kvPairJsonString(name,value);
                                $("#"+that.options.id+"_kvlv_final_list option[value='" + valStr +"']").attr("selected", "selected");  
                            } else {
                                //just add to list
                                $("#"+that.options.id+"_kvlv_final_list")
                                   .append($("<option></option>")
                                   .attr("value", that._kvPairJsonString(name,value))
                                   .attr("selected", "selected")
                                   .text(value));
                                
                            }
                            //clear input
                            $("#"+that.options.id + "_input").val("");
                            //events
                            that.options.onAfterAdd(that._kvPairJsonString(name,value));
                            
                            //update hidden value 
                            that._updateHiddenInput(that);
                         
                       });
                }
                          
            },
            _create: function() {
                //alert('create');
                    var options = this.options;
                    
                    var that = this;
                    var select = this.element.hide(),
                            selected = select.children( ":selected" ),
                            wrapper = this.wrapper = $( "<div>" )
                                .addClass( "multi-part-element" )
                                .insertAfter( select ),
                           
                            inputwrapper = this.inputwrapper = $("<div>")
                                .attr("id", that.options.id + "_input_wrapper")
                                .appendTo (wrapper),
                           
                              
                            listwrapper = this.listwrapper = $("<div>")
                                .attr("id", that.options.id + "_list_wrapper")
                                .appendTo (wrapper),
                                
                            tablewrapper = this.tablewrapper = $("<table>")
                                .addClass("dynamic-configuration")
                                .attr("id",that.options.id + "_table_wrapper")
                                .appendTo(inputwrapper);
   

                           
                           //final list
                           this.selectList = $("<select>")
                                .attr("id",that.options.id + "_kvlv_final_list")
                                .css('width', '300')
                                .attr('size',this.options.size)
                                .addClass ("ui-sb-select")
                                .appendTo (listwrapper);
                           
                           
                           $("<br>").appendTo (listwrapper);
                           
                           $('<input type="button" value="Up" >')
                                .appendTo (listwrapper)
                                .addClass ("multi-part-element-btn-small")
                                .click(function(event) {
                                     //get selected index
                                    if ($("#"+that.options.id+"_kvlv_final_list option:selected")){
                                       var kvPairStr =  $("#"+that.options.id+"_kvlv_final_list").val();
                                       var kvPair = JSON.parse(kvPairStr);
                                
                                       var indexSelected = $("#"+that.options.id+"_kvlv_final_list option")
                                       .index($("#"+that.options.id+"_kvlv_final_list option:selected"));  
                                    
                                       //add a copy to be moved
                                       if (indexSelected > 0){
                                           //remove original
                                           $("#"+that.options.id+"_kvlv_final_list option:eq(" + (indexSelected) +")").remove();
                                       
                                           $("#"+that.options.id+"_kvlv_final_list option:eq(" + (indexSelected-1) +")")
                                                .before("<option value='"+ kvPairStr+"'>"+ kvPair.name + ' ' + kvPair.value +"</option>");
                                                
                                           //update hidden value 
                                           that._updateHiddenInput(that);
                                          
                                           //highlight base on value
                                           $("#"+that.options.id+"_kvlv_final_list option[value='" + kvPairStr +"']").attr("selected", "selected");  
                                       }
                                    }
                                 });
                           $('<input type="button" value="Down" >')
                                .appendTo (listwrapper)
                                .addClass ("multi-part-element-btn-small")
                                .click(function(event) {
                                    //get selected index
                                    if ($("#"+that.options.id+"_kvlv_final_list option:selected")){
                                       var kvPairStr =  $("#"+that.options.id+"_kvlv_final_list").val();
                                       var kvPair = JSON.parse(kvPairStr);
                                    
                                       var indexSelected = $("#"+that.options.id+"_kvlv_final_list option")
                                           .index($("#"+that.options.id+"_kvlv_final_list option:selected"));
                                       var sizeOfList = $("#"+that.options.id+"_kvlv_final_list option").size();
                                       
                                       //add a copy to be moved
                                       if (indexSelected < (sizeOfList-1)){
                                           $("#"+that.options.id+"_kvlv_final_list option:eq(" + (indexSelected + 1) +")")
                                                .after("<option value='"+ kvPairStr+"'>"+ kvPair.name + ' ' + kvPair.value +"</option>");
                                           //remove original
                                           $("#"+that.options.id+"_kvlv_final_list option:eq(" + (indexSelected) +")").remove();
                                           
                                           //update hidden value  
                                           that._updateHiddenInput(that);
                                           
                                           //highlight base on value
                                           $("#"+that.options.id+"_kvlv_final_list option[value='" + kvPairStr +"']").attr("selected", "selected");  

                                       }
                                    }
                                 });
                           
                           
                           //DELETE
                           $('<input type="button" value="Delete" >')
                                .appendTo (listwrapper)
                                .addClass ("multi-part-element-btn-small")
                                .click(function(event) {
                                    
                                    //extract name and value
                                    var kvPairStr =  $("#"+that.options.id+"_kvlv_final_list").val();
                                    var kvPair = JSON.parse(kvPairStr);
                                    
                                    //delete from final list 
                                    $('option:selected',$("#"+that.options.id+"_kvlv_final_list")).remove();
                                    
                                    //update hidden value
                                    that._updateHiddenInput(that);
                                     
                                    //events
                                    that.options.onAfterDelete(kvPairStr);
                                   
                                   
                                 });
                           
                           //hidden value     
                           $("<input>")
                                .attr("id",that.options.id + "_kvlv_hidden_input")
                                .attr("type", "hidden")
                                .val(JSON.stringify({}))
                                .appendTo (wrapper);
                           
                           //selecting final list
                           $("#" + that.options.id + "_kvlv_final_list").change(function(){
                                //populate name and value
                                //var selectedIndex = $(this + " option").index( $(this + " option:selected")); 
                                var selectedVal = $(this).val();
                                var listValue = JSON.parse(this.value);
                                var name=listValue.name, val = listValue.value;
                                
                                //reset "selected"
                                that._clearSelected($("#"+that.options.id+"_kvlv_final_list"));  
                                $("#"+that.options.id+"_kvlv_final_list option[value='" + selectedVal +"']").attr("selected", "selected");
                                
                                //$(this + " option:eq(" + selectedIndex + ")").attr("selected","selected");
                                var options = $(this).find('option');
                              
                           });
                                
            },

            destroy: function() {
                   this.wrapper.remove();
                   this.element.show();
                   $.Widget.prototype.destroy.call( this );
            }
          });
       })( jQuery );