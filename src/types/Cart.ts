export enum CartStatus {
  CART_STATUS_OPEN = 'CART_STATUS_OPEN',
  CART_STATUS_AWAITING_PAYMENT = 'CART_STATUS_AWAITING_PAYMENT',
  CART_STATUS_PAID = 'CART_STATUS_PAID',
  CART_STATUS_CLOSED = 'CART_STATUS_CLOSED',
  CART_STATUS_ABANDONED = 'CARD_ABANDONED',
  CART_STATUS_FAILED = 'CART_STATUS_FAILED',
}

// /**
//      * @ORM\Id
//      * @ORM\GeneratedValue(strategy="AUTO")
//      * @ORM\Column(type="integer")
//      */
// private ?int $id = null;

// /**
//  * @ORM\ManyToOne(targetEntity="Customer", inversedBy="carts", cascade={"persist"})
//  * @ORM\JoinColumn(name="customer_id", referencedColumnName="id", nullable=true)
//  */
// private ?Customer $customer = null;

// /**
//  * @ORM\OneToOne(targetEntity="Booking")
//  * @ORM\JoinColumn(name="booking_id", referencedColumnName="id", nullable=true)
//  */
// private ?Booking $booking = null;

// /**
//  * @ORM\OneToMany(targetEntity="Payment", mappedBy="cart")
//  */
// private Collection $payments;

// /**
//  * @ORM\Column(type="string")
//  */
// private string $lang;

// /**
//  * @ORM\Column(type="date")
//  */
// private Carbon $start;

// /**
//  * @ORM\Column(type="date")
//  */
// private Carbon $end;

// /**
//  * @ORM\ManyToOne(targetEntity="Promocode")
//  * @ORM\JoinColumn(name="promocode_id", referencedColumnName="id", nullable=true)
//  */
// private ?Promocode $promocode = null;

// /**
//  * @var BookingOption[]
//  * @ORM\Column(type="booking_option_array")
//  */
// private array $options = [];

// /**
//  * @var BookingGiftCard[]
//  * @ORM\Column(type="booking_giftcard_array")
//  */
// private array $giftCards = [];

// /**
//  * @var BookingGuest[]
//  * @ORM\Column(type="booking_guest_array")
//  */
// private array $guests = [];

// /**
//  * @ORM\Column(type="string")
//  */
// private string $status = self::CART_STATUS_OPEN;
