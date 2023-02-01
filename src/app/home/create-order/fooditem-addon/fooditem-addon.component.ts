import { Component, OnInit, Inject } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreateOrderService } from '../create-order.service'
import { FormGroup, FormBuilder, FormArray, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShopCartService } from 'src/app/shared/shop-cart/shop-cart.service';
import { TranslateService } from '@ngx-translate/core';
import { SessionStorageService } from 'ngx-webstorage';
import { RequestUtilService } from "src/app/shared/services/request-util.service";
@Component({
  selector: 'app-fooditem-addon',
  templateUrl: './fooditem-addon.component.html',
  styleUrls: ['./fooditem-addon.component.scss']
})
export class FooditemAddonComponent implements OnInit {
  // @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  constructor(
    public dialogRef: MatDialogRef<FooditemAddonComponent>,
    private service: CreateOrderService,
    private formBuilder: FormBuilder,
    private shopCartService: ShopCartService,
    private translateService: TranslateService,
    private sessionStorageService: SessionStorageService,
    private reqUtil: RequestUtilService,

    @Inject(MAT_DIALOG_DATA) private _data: any,
    ) { 

    }

  editFoodSizeId;
  editAddonIdList;
  editQuantity = 1;

  cartItem;
  public itemCart: FormGroup;
  checkedAddonItem = [];

  sizeNotSelected = false;

  menusList: any;
  food_image: String;
  price: number;
  quantity: number;
  item_name: any;
  item_name_ch: any;
  item_name_bm: any;
  desc: String;
  desc_bm: String;
  desc_ch: String;

  addToCart: any;
  addonItems = [];
  foodSize = [];
  onePrice = 0;
  currentLanguage = 'en';
  foodSizeId = null;
  foodAddOnCategoryList = [];
  merchant: any;
  defaultLangIdCatList = [];
  

  showInstruction: boolean = false;

  categories = [];
  categoryFilterLang = [];

  createItemCartForm() {
    this.itemCart = this.formBuilder.group({
      addonItems: new FormArray([]),
      foodSizes: null,
      price: 0,
      quantity: [this.quantity, Validators.min(1)],
      itemId: [''],
      instruction: [''],
      itemName: [''],
      itemNameCh: [''],
      totalPrice: 0,
      itemImage: ['']
    })
  }
  

  validationRequiredFormArray(foodAddOnCategoryList: any , enCategoryList): ValidatorFn {
    // foodAddonCategoryList without duplicate
    foodAddOnCategoryList = foodAddOnCategoryList.filter((foodAddOnCategory, index, self) =>
    index === self.findIndex((t) => (
      t.en.id === foodAddOnCategory.en.id
    ))
  )

    return (formArray: FormArray): ValidationErrors | null => {
      
      for(var i = 0; i < foodAddOnCategoryList.length; i++) {
        
        let foodAddOnCategory =  foodAddOnCategoryList[i];
        let valueFoundInRequiredCategory: Boolean = false;
        let firstFormGroupInCategory;
        for(var x = 0; x < formArray.controls.length; x ++) {
          let formGroup = <FormGroup> formArray.controls[x] ;
          //if category is required, published and form group is under the category.
          if(foodAddOnCategory["general"].status === "PUBLISHED" &&
            formGroup.controls['defaultCategoryLangId'].value === foodAddOnCategory['en']['defaultLangId'] &&
            foodAddOnCategory["general"].required) {
              if(formGroup.value['checked'] === true) {
                valueFoundInRequiredCategory = true;
              }
            } else {
              console.log("false");
            }
        }

        //this for loop is to search the first form group under the category.
        for(var x = 0; x < formArray.controls.length; x ++) {
          let formGroup = <FormGroup> formArray.controls[x] ;
          //if category is required, published and form group is under the category.
          if(foodAddOnCategory["general"].status === "PUBLISHED" &&
            formGroup.controls['defaultCategoryLangId'].value === foodAddOnCategory['en']['defaultLangId'] &&
            foodAddOnCategory["general"].required) {

            firstFormGroupInCategory = x;
            break;
        }
      }

        if(foodAddOnCategory["general"].required) {
          if(valueFoundInRequiredCategory) {
            let formGroup = <FormGroup> formArray.controls[firstFormGroupInCategory];
            formGroup.setErrors({required:false});
          } else {
            let formGroup = <FormGroup> formArray.controls[firstFormGroupInCategory];
            formGroup.setErrors({required:true});
          }
        }
        
        
      }
      
      return null;
      
    }
  }
  
  get itemCartPrice() {
    return this.itemCart.controls["price"].value;
  }

  ngOnInit(): void {
    this.merchant = this.sessionStorageService.retrieve("merchant");
    this.checkSupportLangauge();
    if(this._data){
      this.cartItem = this._data.cartItem
      this.editFoodSizeId = this.cartItem.foodSizeBodyDTO.foodSizeGeneralDTO.foodSizeId;
      this.editAddonIdList = this.cartItem.cartAddonDTO;
      this.editQuantity = this.cartItem.quantity;
    }
    this.quantity = this.editQuantity;
    this.createItemCartForm();
    if (this.service.foodItem) {
      this.menusList = this.service.foodItem;

      console.log(this.menusList);

      this.food_image = this.menusList['general'].imageUrl;
      //let priceList = getFoodItemPrices();
      this.itemCart.patchValue({
        //price: this.menusList['foodSizeBodyDTOList'],
        itemId: this.menusList['en'].id,
        itemName: this.menusList['en'].itemName,
        itemImage: this.menusList['general'].imageUrl,
        itemNameCh: this.menusList['ch'].itemName,
        foodSizes: this.editFoodSizeId?this.getEditFoodSize():this.menusList['foodSizeBodyDTOList']['0']
      })
      this.item_name = this.menusList['en'].itemName;
      this.item_name_ch = this.menusList['ch'].itemName;
      this.item_name_bm = this.menusList['bm'].itemName;
      this.desc = this.menusList['en'].description;
      this.desc_ch = this.menusList['ch'].description;
      this.desc_bm = this.menusList['bm'].description;
      this.addonItems = this.menusList.foodItemAddonBodyDTOList;
      this.foodAddOnCategoryList = this.menusList["foodAddOnCategoryBodyDTOList"];
      // this.foodSize = this.menusList['foodSizeBodyDTOList'];
      this.foodSize = this.service.foodSizeList;
      this.totalPrice();
      this.mapToAddonItem();
      this.fetchCategory();
      
      // this.mapToFoodSize();
    } 

    this.itemCart.controls['foodSizes'].valueChanges.subscribe(
      (selectedValue) => {
        this.foodSize;
        this.totalPrice();
      }
    );
    
  }

  getFoodItemPrices() {
    let foodSizeArr = this.menusList['foodSizeBodyDTOList'];

  }

  addItemQuantity() {
    //this.quantity = quantity
    if (this.quantity < 1) {
      this.quantity = 1;
    }
  }

  openIntruction() {
    let a = this.showInstruction;
    if (a == true) {
      this.showInstruction = false;
    } else {
      this.showInstruction = true;
    }
  }

  get generalAddonItems(): FormArray {
    return this.itemCart.get('addonItems') as FormArray;
  }

  getEditFoodSize(){
    
    if(this.editFoodSizeId){
      for(let foodSize of this.menusList['foodSizeBodyDTOList']){
        if (foodSize.foodSizeGeneralDTO.foodSizeId === this.editFoodSizeId){
         return foodSize;
        }
      }
    }
  }

  mapToAddonItem() {
    
    this.addonItems.forEach((item) => {
      const id = item['en'].id;
      const price = item['general'].price;
      const addonName = item[this.currentLanguage].addonItemName;
      const allowQuantity = item['general'].quantity;
      const defaultCategoryLangId = item['singleAddOnCategoryId'];
      this.defaultLangIdCatList.push(item['singleAddOnCategoryId']);
      let quantity;
      let totalPrice;
      let checked = false;
      if(this.editAddonIdList) {
        for(let editAddonItem of this.editAddonIdList) {
          if(id === editAddonItem.addonId) {
            quantity = editAddonItem.quantity;
            totalPrice = editAddonItem.totalPrice;
            checked = true;
            break;
          }
        }
      }
      if(!checked){
        quantity = 1;
        totalPrice = item['general'].price;
      }
      
      this.generalAddonItems.push(this.getGeneralAddonItem(id, checked, price, quantity, addonName, totalPrice, allowQuantity, defaultCategoryLangId));
    });
    
  }

  checkSupportLangauge(){
    if(this.translateService.currentLang == undefined){
      this.currentLanguage = "en"
    } else{
      this.currentLanguage = this.translateService.currentLang;
    }
    if(this.translateService.currentLang != "en"){
        if(this.translateService.currentLang === "ch"){
            if(this.merchant.chAvailable === false){
                this.currentLanguage = 'en';
            }
            
        } else if(this.translateService.currentLang === "bm"){
            if(this.merchant.bmAvailable === false){
                this.currentLanguage = 'en';
            }
        }
    }    
}

  minusQuantity(group: FormGroup){
    let quantity = group.get('quantity').value
    if(quantity-1>0){
      group.patchValue({
        quantity: quantity - 1
      })
    }

  }
  addQuantity(group: FormGroup){
    let quantity = group.get('quantity').value
    group.patchValue({
      quantity: quantity + 1
    })
  }

  getGeneralAddonItem(id?: number, checked?: boolean, price?: number, quantity?: number, addonName?: String, totalPrice?: number, allowQuantity?: Boolean, defaultCategoryLangId?: number) : FormGroup {
    
    // checkbox is required  or not
    // let required = false;
    // for(var x = 0; x < this.menusList['foodAddOnCategoryBodyDTOList'].length; x++) {
    //   let general = this.menusList['foodAddOnCategoryBodyDTOList'][x].general;
    //   if(general.id == defaultCategoryLangId) {
    //     required = true;
    //     break
    //   }
    // }

    return new FormGroup({
      id: new FormControl(id ? id : null),
      checked: new FormControl(checked ? true : false),
      price: new FormControl(price ? price : null),
      quantity: new FormControl(quantity? quantity : null, [Validators.min(1)]),
      addonName: new FormControl(addonName ? addonName: null),
      totalPrice: new FormControl(totalPrice ? totalPrice : null),
      allowQuantity: new FormControl(allowQuantity != undefined? allowQuantity: false ),
      defaultCategoryLangId: new FormControl(defaultCategoryLangId ? defaultCategoryLangId : null)
    });
  }

  getGeneralFoodSize(id?: number, checked?: boolean, price?: number, foodSizeName?: String) : FormGroup {
    return new FormGroup({
      id: new FormControl(id ? id : null),
      checked: new FormControl(checked ? true : false),
      price: new FormControl(price ? price : null),
      foodSizeName: new FormControl(foodSizeName ? foodSizeName: null),
    });
  }

  getAddonItemForLanguageId(languageId) {
    let foundItem;
    this.addonItems.forEach((item) => {
      if (item['en'].id === languageId) {
        foundItem = item;
      }
    });
    return foundItem;
  }

  getAddonItemLabelForLanguageId(languageId) {
  
    if (this.service.foodItem) {
      const item = this.getAddonItemForLanguageId(languageId);
      return item[this.currentLanguage].addonItemName;
    } else {
      const item = this.fetchAddonItemName(languageId);
      return item.addonName;
    }  
    
  }

  getFoodSizeForLanguageId(languageId) {
    let foundItem;
    this.foodSize.forEach((item) => {
      if (item[this.currentLanguage].id === languageId) {
        foundItem = item;
      }
    });
    return foundItem;
  }
  
  getFoodSizeLabelForLanguageId(languageId) {
    if (this.service.foodItem) {
      const item = this.getFoodSizeForLanguageId(languageId);
      return item[this.currentLanguage].sizeName;
    } else {
      const item = this.fetchFoodSizeName(languageId);
      return item.foodSizeName;
    }  
    
  }

  fetchFoodSizeName(languageId) {
    let foundItem;
    this.foodSize.forEach((item) => {
      if (item.id === languageId) {
        foundItem = item;
      }
    });
    return foundItem;
  }
  

  fetchAddonItemName(languageId) {
    let foundItem;
    this.addonItems.forEach((item) => {
      if (item.id === languageId) {
        foundItem = item;
      }
    });
    return foundItem;
  }

  get addonPrice() {
    return null
    //return this.addonItems['general'].price;
  }

  fetchCategory() {
    this.service.readAddOnCategory(this.merchant.domain,this.defaultLangIdCatList).subscribe((res) => {
        this.categories = res;
        this.filterLang(this.categories);
      });
  }

  filterLang(categories) {
    if(categories !== null) {
      this.categoryFilterLang = categories.filter(
        (x) => x.lang == this.currentLanguage
      );
    }
    let enCategoryList = categories.filter(
      (x) => x.lang == this.currentLanguage
    );
   this.itemCart.controls["addonItems"].setValidators(this.validationRequiredFormArray(this.foodAddOnCategoryList,enCategoryList).bind(this));
  }

  identifyFoodAddOnCategory(defaultCategoryLangId, category) {
    let status = false;
    for(var i = 0; i < this.foodAddOnCategoryList.length; i++) {
      let element = this.foodAddOnCategoryList[i];

      if(element[this.currentLanguage].addonCategoryName === category.addonCategoryName &&
        element["general"].status === "PUBLISHED" &&
        category.defaultLangId === defaultCategoryLangId) {
          status = true;
          break;
        } else {
          status = false;
        }

    } 
    return status;
  }

  isSingleCategory(group, category) {
    let categoryListWithoutDuplicate = this.foodAddOnCategoryList.filter((foodAddOnCategory, index, self) =>
    index === self.findIndex((t) => (
      t.en.id === foodAddOnCategory.en.id
    ))
    )

    for(let x = 0; x < categoryListWithoutDuplicate.length; x++) {
      if(categoryListWithoutDuplicate[x]['general'].status == "PUBLISHED" &&
        categoryListWithoutDuplicate[x]['general'].selection == "SINGLE" &&
        categoryListWithoutDuplicate[x]['general'].foodItemAddonCategoryId === group.value.defaultCategoryLangId &&
        categoryListWithoutDuplicate[x]['general'].foodItemAddonCategoryId === category.defaultLangId) {
          return true;
        }
    }
    return false;
  }

  removeValue(event,group){
    console.log("test");
    console.log(event);
    console.log(group);

    let formArray = <FormArray>this.itemCart.controls['addonItems'];
    for(var x = 0; x < formArray.controls.length; x++) {
      let formGroup = <FormGroup>formArray.controls[x];
      if(formGroup.value['defaultCategoryLangId'] === group.value['defaultCategoryLangId']){
        if(formGroup.value['id'] === group.value['id']) {
          formGroup.patchValue({
            checked: false
          })
        } else {
          formGroup.patchValue({
            checked: false
          })
        }
      }
    }

  }

  onRadioChange(event,group) {
    console.log("HIHI");
    console.log(event);
    console.log(group);

    let formArray = <FormArray>this.itemCart.controls['addonItems'];
    for(var x = 0; x < formArray.controls.length; x++) {
      let formGroup = <FormGroup>formArray.controls[x];
      if(formGroup.value['defaultCategoryLangId'] === group.value['defaultCategoryLangId']){
        if(formGroup.value['id'] === group.value['id']) {
          formGroup.patchValue({
            checked: true
          })
        } else {
          formGroup.patchValue({
            checked: false
          })
        }
      }
    }
  }

  calculateAddonTotalPrice(addon) {
    let quantity = addon.controls['quantity'].value;
    let price = addon.controls['price'].value;
    if(quantity < 1){
      addon.patchValue({
        quantity: 1,
      })
    }
    let totalAddonPrice = quantity * price ;
    let id = addon.controls['id'].value;

    let addonItems = this.itemCart.controls['addonItems'].value;
     let matchAddonItemIndex

    for(let i=0; i<addonItems.length; i++){
      var addonLoop = addonItems[i];
      if (addonLoop.id == id) {
        matchAddonItemIndex = i
        // items.splice(item, 1);
        // this.cartItems = items;
      }
    }
      addonItems[matchAddonItemIndex].totalPrice = totalAddonPrice;
      
      this.itemCart.patchValue({
        addonItems : addonItems
      })
    
  }


  totalPrice() {
    //console.log(this.generalFoodSize)
    let foodSize = this.itemCart.controls['foodSizes'].value;
    let price: number = 0;
    let priceList = [];
    // arr.forEach(element => {
    //   if (element.checked == true) {
    //     priceList.push(element.price);
    //   }
    // });

    price = foodSize['foodSizeGeneralDTO'].price;

    // priceList.forEach(element => {
    //   price = price + element;
    // });

    this.itemCart.patchValue({
      price : price
    });

    const quantity = this.itemCart.controls['quantity'].value;
    if (quantity < 1) {
      this.itemCart.patchValue({
        quantity: 1,
      })
      let totalCost = 1* price;
      this.itemCart.patchValue({
        totalPrice: totalCost,
      })
    } else {
      let totalCost = quantity * price;
      this.itemCart.patchValue({
        totalPrice: totalCost,
      })
    }

    //this.validateSizeSelection();
  }



  save() {
    let addOnFormArray = <FormArray>this.itemCart.controls['addonItems'];
    let valid = true;
    for(var x = 0; x < addOnFormArray.length; x++) { 
      if(addOnFormArray.controls[x].errors && addOnFormArray.controls[x].hasError('required') == true) {
        valid = false;
        break
      }
    }

    if(valid) {
      let item = this.itemCart.value;
      let saveStatus = item.foodSizes;
      let resultAddon: any[] = [];
      for(const addonItem of item.addonItems){
        if(addonItem.checked){
          const addon = {
            addonId: addonItem.id,
            addonName: addonItem.addonName,
            quantity: addonItem.quantity
          }
          resultAddon.push(addon);
        }
      }
      const result = {
        id: this.cartItem? this.cartItem.id: '',
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        instruction: item.instruction,
        cartAddonDTO: resultAddon,
        foodSizeId: item.foodSizes.foodSizeGeneralDTO.foodSizeId,
        foodSizeBodyDTO: item.foodSizes,
      }
      
      if (saveStatus != null) {
          this.sizeNotSelected = false;
          this.dialogRef.close(result);
        
      } else {
        this.sizeNotSelected = true;
      }
    } else { //if form is invalid
      
      this.reqUtil.reqError("Select one add on item in add on Category", this.translateService.instant('PLEASE_ONE_ADD_ON_CATEGORY'));
    }

    
  }

  fetchFoodSizes(foodItemId) {
		this.shopCartService.readFoodSizes(foodItemId)
		.subscribe((res)=>{
      this.foodSize = res;
		})
  }
  
  getValueFormArray(
    formArrayName, 
    formGroupName, 
    formControlName
  ) {
    let formArray = this[formArrayName] as FormArray
    if (!formArray) return ''
    let formGroup = formArray.controls[formGroupName] as FormGroup
    if (!formGroup) return ''
    let formControl = formGroup.controls[formControlName] as FormControl
    if (!formControl) return ''

    return formControl.value || ''
  }

}
