import _find from 'lodash/find';
import moment from 'moment';

export default membership => {

    switch (membership.status) {
        case 'active':
            if (!_find(membership.payment_subscriptions, paymentSubscription => paymentSubscription.status === 'active')) {
                if (moment(membership.paid_until).isBefore(moment(), 'day')) {
                    return 'Mangler betalingskort. Betalingsdato overskredet!';
                }
                return 'Mangler betalingskort';
            }
            else if (membership.renewal_failed) {
                return "Automatisk fornyelse fejlet " + membership.renewal_failed + ' gang' + (membership.renewal_failed > 1 ? 'e' : '');
            } else {
                return 'Aktivt';
            }

        case 'cancelled_running':
            let returnText = 'Opsagt f.o.m. ' + moment(membership.cancelled_from_date).format('D. MMMM YYYY') + '.';
            if (
                moment(membership.paid_until).isBefore(
                    moment(membership.cancelled_from_date).subtract(1, 'day'), 'day'
                ) &&
                !membership.payment_subscriptions.length
            ) {
                returnText += ' Mangler betalingskort.';
                if (moment(membership.paid_until).isBefore(moment(), 'day')) {
                    returnText += ' Betalingsdato overskredet';
                }
            }
            if (membership.renewal_failed) {
                returnText += " Automatisk fornyelse fejlet " + membership.renewal_failed + ' gang' + (membership.renewal_failed > 1 ? 'e' : '');
            }
            return returnText;

      case 'ended':
        return 'Stoppet'

    }
};
