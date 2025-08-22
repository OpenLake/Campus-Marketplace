# Users
    1.name
    2.email
        isVarified
        value
    3.password
    4.StudentID
    5.avatar
        url
        default=""
    6.role
        enum=[student, club_admin,vendor_admin,super_admin]
    7.wishList=[ObjectID(),ObjectID()..]->//items
    8.ContactInfo
        PhoneNumber
        HostelName
    9.sellerrating
    10.orderHistory
        sellCount
        purchaseCount

# items
    1.title
    2.discription
    3.price
    4.category : ObjectID-> Reference to Category schema
    5.seller: ObjectID -> user
    6.images 
    7.status 
        enum :[available, outOfStock,..]
    8.tags []
    9.condition 
        enum :["kya condition hai"..,"","",]
    
# vendors
 <!-- Includes Clubs and all Shops -->
    1.name 
    2.discription
    3.logoUrl
    4.vendorType
        enum:["food","clubs"...]
    5.admins : [Ids]
    6.isOpen: bool

# preOrderItmems
    1.title
    2.discription
    3.price
    4.varients [{},{}..]
    5.vendor: Id(Vendor collection)
    6.status:enum[in_stock,outOfStock,preOrder]
    7.preOrderDeadline: DateTime


# orders
    1.buyer 
    2.seller
    3.items[{itemId,quantity,priceAtSale},..]
    4.status

# reviews 

# catergories

# variants

# preOrderDeadlines

