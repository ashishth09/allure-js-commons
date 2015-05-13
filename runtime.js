var Step = require('./beans/step'),
    Attachment = require('./beans/attachment');

var Allure = function() {
    this.flushReport();
    this._currentStep = null;
};

Allure.prototype.createStep = function(name, stepFunc) {
    var allure = this;
    return function() {
        for(var i = 0; i < arguments.length; i++) {
            name = name.replace('{' + i + '}', arguments[i]);
        }
        var parentStep = allure._currentStep,
            status = 'passed',
            step = new Step(name);
        if(parentStep) {
            parentStep.addStep(step);
        } else {
            allure.report.steps.push(step);
        }
        allure._currentStep = step;
        try {
            var result = stepFunc.apply(this, arguments);
        }
        catch(error) {
            status = 'broken';
            throw error;
        }
        finally {
            step.end(status);
            allure._currentStep = parentStep;
        }
        return result;
    }
};

Allure.prototype.createAttachment = function(name, attachmentFunc, type) {
    var allure = this;
    return function() {
        for(var i = 0; i < arguments.length; i++) {
            name = name.replace('{' + i + '}', arguments[i]);
        }
        var buffer = attachmentFunc.apply(this, arguments),
            attachment = new Attachment(name, buffer, type);
        allure.report.attachments.push(attachment);
    }
};

Allure.prototype.addLabel = function(key, value) {
    this.report.labels.push({
        key: key,
        value: value
    });
};

Allure.prototype.flushReport = function() {
    var report = this.report;
    this.report = {
        steps: [],
        attachments: [],
        labels: []
    };
    return report;
};

module.exports = {
    allure: global.allure = new Allure()
};