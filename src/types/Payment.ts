export enum PaymentStatus {
  PAYMENT_STATUS_CREATED = 'CREATED',
  PAYMENT_STATUS_SUCCESS = 'SUCCESS',
  PAYMENT_STATUS_FAILED = 'FAILED',
  PAYMENT_STATUS_CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  PAYMENT_METHOD_CREDIT_CARD = 'CREDIT_CARD',
  PAYMENT_METHOD_GIFT_CARD = 'GIFT_CARD',
  PAYMENT_METHOD_SYSTEM = 'SYSTEM',
}

// /**
//      * @ORM\Id
//      * @ORM\GeneratedValue(strategy="AUTO")
//      * @ORM\Column(type="integer")
//      */
// private int $id;
// /**
//  * @ORM\ManyToOne(targetEntity="Cart", inversedBy="payments")
//  * @ORM\JoinColumn(name="cart_id", referencedColumnName="id", nullable=true)
//  */
// private ?Cart $cart = null;
// /**
//  * @ORM\ManyToOne(targetEntity="Booking", inversedBy="payments", cascade={"persist"})
//  * @ORM\JoinColumn(name="booking_id", referencedColumnName="id", nullable=true)
//  */
// private ?Booking $booking = null;
// /**
//  * @ORM\Column(type="string")
//  */
// private string $paymentMethod;
// /**
//  * @ORM\Column(type="string", nullable=true)
//  */
// private ?string $paymentMethodIdentifier = null;
// /**
//  * @ORM\Column(type="money")
//  */
// private Money $amount;
// /**
//  * @ORM\Column(type="string")
//  */
// private string $status;
// /**
//  * @ORM\Column(type="datetime", nullable=true)
//  */
// private ?Carbon $executedAt = null;
// /**
//  * @ORM\Column(type="string", nullable=true)
//  */
// private ?string $cardHolderFullName = null;
