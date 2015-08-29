(function () {
    ko.extenders.boundedInt = function (target, bounds) {
        var result = ko.computed({
            read: target,
            write: function (newValue) {
                var min = ko.utils.unwrapObservable(bounds.min);
                var max = ko.utils.unwrapObservable(bounds.max);

                var current = target();
                var valueToWrite = parseInt(newValue, 10);
                if ((newValue === '' || newValue === '-') && min < 0) {
                    // Without this check, the user can't enter a negative number (unless they enter the number part first and go back).
                    // Need to check for '' because its a numeric input so the dash gets filtered out I think?
                    valueToWrite = newValue;
                } else if (typeof valueToWrite !== 'number' || isNaN(valueToWrite)) {
                    valueToWrite = null;
                } else if (valueToWrite < min) {
                    valueToWrite = min;
                } else if (valueToWrite > max) {
                    valueToWrite = max;
                }

                if (valueToWrite !== current) {
                    target(valueToWrite);
                } else if (newValue != current) {
                    target.notifySubscribers(valueToWrite);
                }
            }
        });
        result(target());
        return result;
    };

    ko.bindingHandlers.pageTitle = {
        update: function (element, valueAccessor) {
            var title = ko.utils.unwrapObservable(valueAccessor());
            document.title = title;
        }
    };
    ko.virtualElements.allowedBindings.pageTitle = true;

} ());