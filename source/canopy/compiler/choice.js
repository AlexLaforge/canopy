Canopy.Compiler.Choice = {
  expressions: function() {
    if (this._expressions) return this._expressions;
    this._expressions = [this.first_part];
    this.rest.forEach(function(choice) {
      this._expressions.push(choice.expression);
    }, this);
    return this._expressions;
  },

  toSexp: function() {
    var sexp = ['choice'];
    Canopy.forEach(this.expressions(), function(expression) {
      sexp.push(expression.toSexp());
    });
    return sexp;
  },

  compile: function(builder, address, nodeType) {
    var startOffset = builder.localVar_('index', builder.offset_());
    this._compileChoices(builder, 0, address, nodeType, startOffset);
  },

  _compileChoices: function(builder, index, address, nodeType, startOffset) {
    var expressions = this.expressions();
    if (index === expressions.length) return;

    expressions[index].compile(builder, address);

    var onFail = function(builder) {
      builder.assign_(builder.offset_(), startOffset);
      this._compileChoices(builder, index + 1, address, nodeType, startOffset);
    };

    if (nodeType) {
      builder.ifNode_(address, function(builder) {
        builder.extendNode_(address, nodeType);
      }, onFail, this);
    } else {
      builder.unless_(address, onFail, this);
    }
  }
};
