 (function( $ ) {
        $.widget( "f5.optionlistbuilder", {
            options: {
            id: 'default',
            size: '3',
            inputValueWidth:'200',
            //nameList:[],
            //nameData:{},
            dependElementId :'default',
            dataMap: {},
            uniqueKey: false,
            onAfterAdd: function(valueAddedString){},
            onAfterDelete: function(valueDeletedString){}
            },
          
            NONE_TEXT: "None",
            NONE_VALUE: "none",
            NONE: "none",
            REQUIRED_INDICATOR: "*",
            EMPTY_KEY : "",
            _dependElementValue:"",
            _nameObject:{},
            _nameList:[],
            _nameData:{},

             _kvPair: function(key,value,display){
                var obj = {};
                obj.name = key ? key : '';
                obj.value = value ? value : '';
                obj.display = display ? display : '';
                return obj;
             },
             _kvPairJsonString: function(key,value,display){
                return JSON.stringify(this._kvPair(key,value,display));
             },
              _kvPairJsonString: function(key,value){
                return JSON.stringify(this._kvPair(key,value));
             },
             _inputValueChange: function(that){
                //set visibiity and load select options if needed                    
                $("#"+that.options.id + "_kvlv_input_value").val('');
                $("#"+that.options.id + "_kvlv_select_value").find('option').remove();
                
                var firstName = $("#"+that.options.id + "_kvlv_select_name").val();
                var firstObj = that.options.nameData[firstName];
                var inputDisplay = (!firstObj || firstObj.values.length === 0) ? 'inline-block' : that.NONE;
                var selectDisplay = (firstObj && firstObj.values.length > 0) ? 'inline-block' : that.NONE;
                that.inputSelect.css('display',selectDisplay);
                that.inputValue.css('display',inputDisplay);
                //if there are values load select options
                if (selectDisplay !== that.NONE ){
                    $.each(firstObj.values, function(key,value) { 
                        //mark if required
                         $("#" + that.options.id + "_kvlv_select_value")
                             .append($("<option></option>")
                             .attr("value",value)
                             .text(value)); 
                    });
                }   
             },
             _refresh: function(options){
                //select first
                if (!options){
                    options = this.options;
                }
                $("#" + options.id + "_kvlv_select_name").val($("#" + options.id + "_kvlv_select_name option:first").val());
                $("#" + options.id + "_kvlv_select_name").change();
                $("#" + options.id + "_kvlv_input_value").val('');
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
             _init: function(){
                var that = this;
                this._dependElementValue = $("#"+that.options.dependElementId).val();
                this._nameObj = dataMap[this._dependElementValue];
                this._nameList = this._nameObj["valueSelectList"];
                //clear out input table, final list, hidden input
                $("#"+that.options.id + "_table_wrapper tr").remove();
                $("#"+that.options.id + "_kvlv_final_list").find('option').remove().end();
                $("#"+that.options.id + "_kvlv_hidden_input").val("{}");
                var tablewrapper = $("#"+that.options.id + "_table_wrapper");
               
                if (this._nameList.length > 0){
                    $.each(this._nameList, function(key,value) { 
                        var inputRow = $("<tr>")
                            .appendTo(tablewrapper);
                        $("<td>")
                            .addClass("label")
                            .attr("id",that.options.id + "_label_" + key)
                            .text(value)
                            .appendTo(inputRow);
                        var settingsCell = $("<td>")
                            .addClass("settings")
                            .css("width",'400px')
                            .appendTo(inputRow);
                        $("<input>")
                            .css("width",'400px')
                            .attr("id",that.options.id + "_settings_" + key)
                            .appendTo(settingsCell);
                        var buttonCell = $("<td>")
                            .appendTo(inputRow);
                        $('<input type="button" value="Add" >')
                            .appendTo(buttonCell)
                            .click(function(event) {
                                var name = $(this)
                                    .closest('tr')
                                    .find('.label')
                                    .text(); 
                                var value = $(this)
                                    .closest('tr')
                                    .find('input')
                                    .not('input[type=button]')
                                    .val();
                                that._clearSelected($("#"+that.options.id+"_kvlv_final_list"));
                                //var value = that.inputValue.is(":visible") ? that.inputValue.val() : (that.inputSelect.is(":visible") ? that.inputSelect.val() : "");
                                //var name = that.nameValue.val() != null ? that.nameValue.val() : that.EMPTY_KEY;
                                //var display = (that.options.nameData[name] && that.options.nameData[name].required) ? name + that.REQUIRED_INDICATOR : name;
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
                                
                                //if key/val already used or uniqueKey is maintained update
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
                                
                                $("#" + options.id + "_kvlv_select_name").change();
                              
                            });
                            
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
                                .addClass("configuration")
                                .attr("id",that.options.id + "_table_wrapper")
                                .appendTo(inputwrapper)
                                ;
                            
                            
                            
                            
                           

                            //set width
                            var valueWidth = $("#"+that.options.id+"_kvlv_input_value").innerWidth(),
                            selectWidth = $("#"+that.options.id+"_kvlv_select_value").innerWidth(),
                            nameWidth = $("#"+that.options.id+"_kvlv_select_name").outerWidth(true);
                            
                            //final list
                            this.selectList = $("<select>")
                                .attr("id",that.options.id + "_kvlv_final_list")
                                .css('width', '300')
                                .attr('size',this.options.size)
                                .addClass ("ui-sb-select")
                                .appendTo (listwrapper);
                            
                            $("#"+that.options.id + "_input_wrapper_inputs")
                                .css('width', valueWidth + nameWidth + selectWidth)
                            
                            
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
                                                .before("<option value='"+ kvPairStr+"'>"+ kvPair.display + ' ' + kvPair.value +"</option>");
                                                
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
                                                .after("<option value='"+ kvPairStr+"'>"+ kvPair.display + ' ' + kvPair.value +"</option>");
                                            //remove original
                                            $("#"+that.options.id+"_kvlv_final_list option:eq(" + (indexSelected) +")").remove();
                                            
                                            //update hidden value  
                                            that._updateHiddenInput(that);
                                            
                                            //highlight base on value
                                            $("#"+that.options.id+"_kvlv_final_list option[value='" + kvPairStr +"']").attr("selected", "selected");  

                                        }
                                    }
                                 });
                            
                            //only allow edit if there are names in namelist
                            if (this._nameList.length > 0){
                                $('<input type="button" value="Edit" >')
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
                                        
                                        //adjust input values
                                        that._inputValueChange(that);
                                        
                                     });
                            }
                            
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
                                    
                                    //reset input values
                                    that._refresh(that.options);
                                   
                                 });
                            
                            //hidden value     
                            $("<input>")
                                .attr("id",that.options.id + "_kvlv_hidden_input")
                                .attr("type", "hidden")
                                .val(JSON.stringify({}))
                                .appendTo (wrapper);
                            
                            $("#" + options.id + "_kvlv_select_name").change(function(){
                                //adjust input values
                                that._inputValueChange(that);
                                //reset add button
                                $("#"+that.options.id+ "_add_btn").val("Add");
                                //if key in list and unique key change add button to replace
                                var nameSelectVal = $(this).val();
                                $("#"+that.options.id+"_kvlv_final_list > option").each(function() {
                                    var valueObj = JSON.parse(this.value);
                                    if (that.options.uniqueKey === true && nameSelectVal === valueObj.name){
                                        $("#"+that.options.id+ "_add_btn").val("Replace");
                                        return;
                                    }
                                });
                            });
                            
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
                               
                                //set select input or 
                                $("#"+that.options.id + "_kvlv_select_name").val(name);
                                $("#"+that.options.id + "_kvlv_select_name").change();
                                $("#"+that.options.id + "_kvlv_input_value").val(val);
                               
                            });
                                
             },

             destroy: function() {
                   this.wrapper.remove();
                   this.element.show();
                   $.Widget.prototype.destroy.call( this );
             }
          });
       })( jQuery );