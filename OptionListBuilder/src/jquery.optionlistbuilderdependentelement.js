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
            REQUIRED_INDICATOR: "*",
            EMPTY_KEY : "",
            _dependElementValue:"",
            _nameObject:{},
            _nameList:[],
            _valueObject:{},
            _valueList:[],
            _wrapperInputWidth:'',

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
         
             _inputValueChange: function(that){
                //set visibility and load select options if needed 
               
                //clear old values
                $("#"+that.options.id + "_kvlv_input_value").val('');
                var inputDisplay = 'inline-block';
                var selectDisplay = that.NONE;
                
                //if names available set value
                if (!jQuery.isEmptyObject(this.options.nameMap)){
                   
                    
                    //lookup up value list based on depend element value + name value
                    //if it exists use the select for input
                    var firstName = $("#"+that.options.id + "_kvlv_select_name").val();
                    if (!jQuery.isEmptyObject(this.options.valueMap)) {
                         $("#"+that.options.id + "_kvlv_select_value").find('option').remove();
                        this._valueObject = that.options.valueMap[this._dependElementValue + firstName];
                        this._valueList = this._valueObject.valueSelectList;
                        inputDisplay = (!this._valueObject || this._valueList.length === 0) ? 'inline-block' : that.NONE;
                        selectDisplay = (this._valueObject && this._valueList.length > 0) ? 'inline-block' : that.NONE;
                        that.inputSelect.css('display',selectDisplay);
                        that.inputValue.css('display',inputDisplay);
                        //if there are values load select options
                        if (selectDisplay !== that.NONE ){
                            $.each(this._valueList, function(key,value) { 
                                //mark if required
                                 $("#" + that.options.id + "_kvlv_select_value")
                                     .append($("<option></option>")
                                     .attr("value",value)
                                     .text(value)); 
                            });
                        } 
                   }
                }                               
                //set wrapper input width
                this._wrapperInputWidth = $("#"+that.options.id + "_kvlv_select_name").outerWidth(true);
                if (inputDisplay !== that.NONE){
                    this._wrapperInputWidth += that.inputValue.outerWidth(true);
                } else if (selectDisplay !== that.NONE){
                    this._wrapperInputWidth += that.inputSelect.outerWidth(true);
                }
                 //set width fo final list based on size of input
                $("#"+that.options.id + "_kvlv_final_list")
                    .css('width',this._wrapperInputWidth);
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
             _highlightOptionByValue: function(value){
                var that = this;
                $("#"+that.options.id+"_kvlv_final_list option[value='" + value +"']").attr("selected", "selected");
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
            nameChange: function(){
                this._nameValueChange();
            },
            _changeAddToReplace: function(){
                var that = this;
                var nameSelectVal = $("#"+ that.options.id + "_kvlv_select_name").val();
                $("#"+that.options.id+"_kvlv_final_list > option").each(function() {
                    var valueObj = JSON.parse(this.value);
                    if (that.options.uniqueKey === true && nameSelectVal === valueObj.name){
                        $("#"+that.options.id+ "_add_btn").val("Replace");
                        return;
                    }
                });
            },
            _nameValueChange: function(){
                var that = this;
               
                //clear out final list & hidden input
                $("#"+that.options.id + "_kvlv_final_list").find('option').remove().end();
                that._updateHiddenInput(that);
                
                //reset add button to "Add"
                $("#"+that.options.id+ "_add_btn").val("Add");
                
                //remove old inputs
                this.inputwrapperInputs.empty();
                
                //create and fill name select
                if (!jQuery.isEmptyObject(this.options.nameMap)){
                    this._dependElementValue = $("#"+that.options.dependElementId).val();
                    this._nameObject = that.options.nameMap[this._dependElementValue];
                    this._nameList = this._nameObject["valueSelectList"];
                    this.nameValue = $("<select>")
                        .appendTo (this.inputwrapperInputs)
                        .css('display','inline-block')
                        .attr("id", that.options.id + "_kvlv_select_name")
                        .change(function(){
                                //adjust input values
                                that._inputValueChange(that);
                                //reset add button
                                $("#"+that.options.id+ "_add_btn").val("Add");
                                //if key in list and unique key change add button to replace
                                that._changeAddToReplace();
                                
                            });
                    $.each(this._nameList, function(key,name) { 
                        //mark if required
                        var display = (that.options.valueMap[that.options._dependElementValue + name] && that.options.valueMap[that.options._dependElementValue + name].required) ? name + that.REQUIRED_INDICATOR : name;
                         $("#" + that.options.id + "_kvlv_select_name")
                             .append($("<option></option>")
                             .attr("value",name)
                             .text(display)); 
                    });
                }
                if (!jQuery.isEmptyObject(this.options.valueMap)){
                    this.inputSelect = $( "<select>" )
                    .appendTo( this.inputwrapperInputs )
                    .attr( "title", "") 
                    .attr("id",that.options.id + "_kvlv_select_value")
                    .css('display','inline-block')
                    .addClass( "ui-sb-value_select" );
                }
                 
                
                this.inputValue = $( "<input>" )
                    .appendTo( this.inputwrapperInputs )
                    .attr( "title", "") 
                    .attr("id",that.options.id + "_kvlv_input_value")
                    .css('width', that.options.inputValueWidth)
                    .css('display','inline-block')
                    .addClass( "ui-sb-value ui-sb-input" );
               
                //update value entry (input or select)
                that._inputValueChange(that);
                           
             },
             _create: function() {
                //alert('create');
                    var options = this.options;
                    
                    var that = this;
                    var select = this.element.hide(),
                            selected = select.children( ":selected" ),
                             wrapper = this.wrapper = $( "<div>" )
                                .addClass( "multi-part-element" )
                                .insertAfter( select );
                            
                            inputwrapper = this.inputwrapper = $("<div>")
                                .attr("id", that.options.id + "_input_wrapper")
                                .appendTo (wrapper);
                            inputwrapperInputs = this.inputwrapperInputs = $("<span>")
                                .attr("id", that.options.id + "_input_wrapper_inputs")
                                .css('display','inline-block')
                                .appendTo (inputwrapper)
                               
                            listwrapper = this.listwrapper = $("<div>")
                                .attr("id", that.options.id + "_list_wrapper")
                                .appendTo (wrapper);
                            
                           
                            that._nameValueChange();
                            
                            
                             //ADD
                            this.addButton = $('<input type="button" value="Add" >')
                                .appendTo (inputwrapper)
                                .attr("id",that.options.id+ "_add_btn")
                                .addClass ("multi-part-element-btn-small");
                            this.addButton.click(
                                function(event) {
                                    //unique key is optional, but unique key/value is mandatory
                                    that._clearSelected($("#"+that.options.id+"_kvlv_final_list"));
                                    var value = that.inputValue.is(":visible") ? that.inputValue.val() : (that.inputSelect.is(":visible") ? that.inputSelect.val() : "");
                                    var name = (that.nameValue && that.nameValue.val() != null) ? that.nameValue.val() : that.EMPTY_KEY;
                                    //required is determined at the level of the parameter
                                    var display = (that.options.valueMap[that.options._dependElementValue + name] && that.options.valueMap[that.options._dependElementValue + name].required) ? name + that.REQUIRED_INDICATOR : name;
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
                                        var valStr = that._kvPairJsonString(name,value,display);
                                        $("#"+that.options.id+"_kvlv_final_list option[value='" + valStr +"']").attr("selected", "selected");  
                                    } else  if (that.options.uniqueKey && keyInList){ 
                                        //update select list
                                        $("#"+that.options.id+"_kvlv_final_list > option").each(function() {
                                            var valueObj = JSON.parse(this.value);
                                            if (valueObj.name === name){
                                                $(this).text(display + ' ' + value)
                                                $(this).val(that._kvPairJsonString(name,value,display));
                                                $(this).attr("selected","selected");
                                                return;
                                            }
                                        });
                                    } else {
                                        //just add to list
                                        $("#"+that.options.id+"_kvlv_final_list")
                                            .append($("<option></option>")
                                            .attr("value", that._kvPairJsonString(name,value,display))
                                            .attr("selected", "selected")
                                            .text(display + ' ' + value));
                                        
                                    }
                                    //events
                                    that.options.onAfterAdd(that._kvPairJsonString(name,value,display));
                                    
                                    //update hidden value 
                                    that._updateHiddenInput(that);

                                    //"add" or "replace"
                                    that._changeAddToReplace();
                                    //////////$("#" + options.id + "_kvlv_select_name").change();
                                 }
                            );

                           

                            
                            
                            //final list
                            this.selectList = $("<select>")
                                .attr("id",that.options.id + "_kvlv_final_list")
                                //.css('width', '300')
                                .attr('size',this.options.size)
                                .addClass ("ui-sb-select")
                                .appendTo (listwrapper);
                            
                            //set width fo final list based on size of input
                            $("#"+that.options.id + "_kvlv_final_list")
                                .css('width',this._wrapperInputWidth);
                            
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