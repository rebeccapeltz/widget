(function( $ ) {
            $.widget( "becky.combobox", {
                 options: {
                 theSource: [],
                 force: true,
                 inputId:null
                
                 },
                 getValue: function(){
                    return this.input.val();
                 },
                 removeFromSource: function(value){
                    var newSource = [];
                    for (var i=0;i<this.options.theSource.length;i++){
                        if (this.options.theSource[i] !== value){
                            newSource.push(this.options.theSource[i]);
                        }
                    }
                    this.options.theSource = newSource;
                    this.input.autocomplete("option","source",newSource);
                    this.input.val(this.options.theSource && this.options.theSource.length >0 ? this.options.theSource[0]: "");
                 },
                 addToSource: function(value){
                    this.options.theSource.push(value);
                    this.input.autocomplete("option","source",this.options.theSource);
                    this.input.val(this.options.theSource && this.options.theSource.length >0 ? this.options.theSource[0]: "");
                 },
                 _create: function() {
                        var options = this.options;
                        var that = this,
                              select = this.element.hide(),
                              selected = select.children( ":selected" ),
                              value = options.theSource && options.theSource.length >0 ? options.theSource[0]: "", //selected.val() ? selected.text() : "",
                              wrapper = this.wrapper = $( "<span>" )
                                     .addClass( "ui-combobox" )
                                     .insertAfter( select );
                                     
                        function removeIfInvalid(element) {
                              var value = $( element ).val(),
                                     matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( value ) + "$", "i" ),
                                     valid = false;
                              select.children( "option" ).each(function() {
                                     if ( $( this ).text().match( matcher ) ) {
                                            this.selected = valid = true;
                                            return false;
                                     }
                              });
                               if ( !valid && options.force===true) {
                                     // remove invalid value, as it didn't match anything
                                     $( element )
                                            .val(options.theSource[0]) //.val( "" )
                                            .attr( "title", value + " didn't match any item - choose item from list" )
                                            .tooltip( "open" );
                                     select.val( "" );
                                     setTimeout(function() {
                                            that.input.tooltip( "close" ).attr( "title", "" );
                                     }, 2500 );
                                     that.input.data( "autocomplete" ).term = "";
                                     return false;
                              }
                        }

                        this.input = $( "<input>" )
                            .appendTo( wrapper )
                            .val( value )
                            .attr( "title", "" )
                            .addClass( "ui-state-default ui-combobox-input" )
                            .autocomplete({
                                     delay: 0,
                                     minLength: 0,
                                     source: options.theSource,
                                     select: function( event, ui ) {
                                            //ui.item.option.selected = true;
                                            that._trigger( "selected", event, {
                                                   //item: ui.item.option
                                                   item: ui.item.value
                                            });
                                     },
                                     change: function( event, ui ) {
                                            if ( options.theSource && options.theSource.length>0 &&  !ui.item )
                                                   return removeIfInvalid( this );
                                            //var v =$(this).val();
                                     }
                              })
                              .addClass( "ui-widget ui-widget-content ui-corner-left" );
                        this.input.data( "autocomplete" )._renderItem = function( ul, item ) {
                              return $( "<li>" )
                                     .data( "item.autocomplete", item )
                                     .append( "<a>" + item.label + "</a>" )
                                     .appendTo( ul );
                        };
                        if (options.inputId){
                            this.input.attr('id', options.inputId);
                        }
                        
                       $( "<a>" )
                              .attr( "tabIndex", -1 )
                              .attr( "title", "Show All Items" )
                              .tooltip()
                              .css("display","inline-block")
                              .appendTo( wrapper )
                              .button({
                                     icons: {
                                            primary: "ui-icon-triangle-1-s"
                                     },
                                     text: false
                              })
                              .removeClass( "ui-corner-all" )
                              .addClass( "ui-corner-right ui-combobox-toggle" )
                              .click(function() {
                                     // close if already visible
                                     if ( that.input.autocomplete( "widget" ).is( ":visible" ) ) {
                                            input.autocomplete( "close" );
                                            //removeIfInvalid( input );
                                            return;
                                     }

                                     // work around a bug (likely same cause as #5265)
                                     $( this ).blur();

                                     // pass empty string as value to search for, displaying all results
                                     that.input.autocomplete( "search", "" );
                                     that.input.focus();
                              });

                              that.input.tooltip({
                                            position: {
                                                   of: this.button
                                            },
                                            tooltipClass: "ui-state-highlight"
                                     });
                 },

                 destroy: function() {
                       this.wrapper.remove();
                       this.element.show();
                       $.Widget.prototype.destroy.call( this );
                 }
              });
       })( jQuery );